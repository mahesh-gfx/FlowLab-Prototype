import { Request, Response, NextFunction } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || "1h"; // Default to 1 hour if not set

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(
    firstName: string,
    lastName: string,
    age: number,
    email: string,
    password: string
  ): Promise<any> {
    const user = new User();
    user.firstName = firstName;
    user.lastName = lastName;
    user.age = age;
    user.email = email;
    user.password = password;

    const userExists = await this.userRepository.count({
      where: {
        email: email,
      },
    });

    if (userExists > 0) {
      console.log("user already exists!");
      throw Error("The user already exists! Try loggin in...");
    } else {
      return await this.userRepository
        .save(user)
        .then((response) => {
          console.log("Create user response: ", response);
          if (response != null)
            return {
              status: 201,
              message: "Registered user successfully!",
            };
          else throw new Error("Error registering user! Try again...");
        })
        .catch((error: any) => {
          return { data: { status: 500, message: error.message } };
        });
    }
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    });
    return {
      status: 201,
      token,
      user: `${user.firstName + " " + user.lastName}`,
    };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).send({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = this.verifyToken(token);
      (req as any).user = decoded;
      next();
    } catch (error) {
      res.status(401).send({ message: "Invalid token" });
    }
  }
}

const authService = new AuthService();

export default authService;
