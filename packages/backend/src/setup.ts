import { exec } from "child_process";
import { Client } from "pg";
import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import os from "os";
import spawn from "cross-spawn";

async function checkPostgresInstallation(): Promise<boolean> {
  return new Promise((resolve) => {
    exec("psql --version", (error) => {
      if (error) {
        console.log("PostgreSQL is not installed.");
        resolve(false);
      } else {
        console.log("PostgreSQL is already installed.");
        resolve(true);
      }
    });
  });
}

async function installPostgres() {
  console.log("Installing PostgreSQL...");
  return new Promise((resolve, reject) => {
    const platform = os.platform();
    let installCommand = "";

    if (platform === "win32") {
      console.log(
        "Windows detected. Please install PostgreSQL manually from https://www.postgresql.org/download/windows/"
      );
      resolve(true); // On Windows, we prompt for manual installation.
    } else if (platform === "darwin") {
      installCommand = "brew install postgresql";
    } else if (platform === "linux") {
      installCommand =
        "sudo apt-get update && sudo apt-get install -y postgresql";
    }

    if (installCommand) {
      const child = spawn(installCommand, { shell: true, stdio: "inherit" });
      child.on("close", (code) => {
        if (code === 0) {
          console.log("PostgreSQL installed successfully.");
          resolve(true);
        } else {
          console.error("Failed to install PostgreSQL.");
          reject(new Error("Failed to install PostgreSQL."));
        }
      });
    }
  });
}

async function createDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE ${process.env.DB_NAME}`);
    console.log(`Database ${process.env.DB_NAME} created.`);
  } catch (error: any) {
    if (error.code === "42P04") {
      console.log(`Database ${process.env.DB_NAME} already exists.`);
    } else {
      throw error;
    }
  } finally {
    await client.end();
  }
}

async function checkTableAndDataExists() {
  const connection = AppDataSource.isInitialized
    ? AppDataSource
    : await AppDataSource.initialize();
  const userRepository = connection.getRepository(User);

  // Check if the table exists by counting the records
  const count = await userRepository.count();
  return count > 0;
}

async function createTablesAndSampleData() {
  try {
    const connection = AppDataSource.isInitialized
      ? AppDataSource
      : await AppDataSource.initialize();
    console.log("Data Source has been initialized!");

    const tableAndDataExists = await checkTableAndDataExists();

    if (!tableAndDataExists) {
      // Create tables
      await connection.synchronize();
      console.log("Tables have been created");

      // Insert sample data
      const userRepository = connection.getRepository(User);
      const sampleUser = new User();
      sampleUser.firstName = "John";
      sampleUser.lastName = "Doe";
      sampleUser.email = "john@example.com";
      sampleUser.password = "password"; // This will be hashed by the @BeforeInsert hook
      sampleUser.age = 30;
      await userRepository.save(sampleUser);
      console.log("Sample data has been inserted");
    } else {
      console.log(
        "Table and data already exist. Skipping creation and insertion."
      );
    }
  } catch (error) {
    console.error("Error during Data Source initialization", error);
    throw error;
  }
}

export async function setupDatabase() {
  const isPostgresInstalled = await checkPostgresInstallation();
  if (!isPostgresInstalled) {
    await installPostgres();
  }

  await createDatabase();
  await createTablesAndSampleData();
}
