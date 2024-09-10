# Contributing to FlowLab

We're thrilled that you're interested in contributing to FlowLab! This document provides guidelines for contributing to this project. By participating in this project, you agree to abide by its terms.

## Table of Contents

- [Contributing to FlowLab](#contributing-to-flowlab)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
  - [How to Contribute](#how-to-contribute)
    - [Reporting Bugs](#reporting-bugs)
    - [Suggesting Enhancements](#suggesting-enhancements)
    - [Your First Code Contribution](#your-first-code-contribution)
  - [Pull Request Process](#pull-request-process)
  - [Style Guidelines](#style-guidelines)
    - [Git Commit Messages](#git-commit-messages)
    - [Commit message Types](#commit-message-types)
    - [Emojis to use](#emojis-to-use)
    - [Example 1 (single line commit message)](#example-1-single-line-commit-message)
    - [Example 2(multi-line commit message)](#example-2multi-line-commit-message)
    - [Scope](#scope)
    - [Subject](#subject)
    - [Message Body](#message-body)
    - [Message Footer](#message-footer)
    - [TypeScript Style Guide](#typescript-style-guide)
    - [React Style Guide](#react-style-guide)
    - [Backend Style Guide](#backend-style-guide)
      - [References:](#references)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [maintainer's email].

## Getting Started

1. Fork the repository on GitHub.
2. Clone your fork locally.
   `git clone https://github.com/<your_github_username>/FlowLab-Prototype.git`
3. Set up the development environment as described in the project's README.md.
4. Create a new branch for your feature or bug fix.

## How to Contribute

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2. Update the README.md with details of changes to the interface, this includes new environment variables (Update the .env.example), exposed ports, useful file locations, and container parameters.
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.

### Reporting Bugs

- Use the GitHub Issues page to report bugs.
- Describe the bug in detail, including steps to reproduce.
- Include information about your environment (OS, Node.js version, etc.).

### Suggesting Enhancements

- Use GitHub Issues to suggest enhancements.
- Provide a clear description of the enhancement and its expected behavior.
- Explain why this enhancement would be useful to most users.

### Your First Code Contribution

- Start with issues labeled "good first issue" or "beginner-friendly".
- Ask for help in the comments if you're stuck.

## Pull Request Process

1. Ensure your code adheres to the project's coding standards.
2. Add tests for new features or bug fixes.
3. Update documentation as necessary.
4. Ensure all tests pass locally before submitting the PR.
5. Include a description of the changes in your PR.
6. Link any relevant issues in the PR description.
7. Be prepared to make changes based on feedback.

## Style Guidelines

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line
- When only changing documentation, include `[ci skip]` in the commit title
- Consider starting the commit message with an applicable emoji

### Commit message Types

|       Type       | Description                                       |
| :--------------: | ------------------------------------------------- |
|      `new`       | for new feature implementing commit               |
| `feat / feature` | for new feature implementing commit (equal `new`) |
|     `update`     | for update commit                                 |
|      `bug`       | for bug fix commit                                |
|    `security`    | for security issue fix commit                     |
|  `performance`   | for performance issue fix commit                  |
|  `improvement`   | for backwards-compatible enhancement commit       |
|    `breaking`    | for backwards-incompatible enhancement commit     |
|   `deprecated`   | for deprecated feature commit                     |
|      `i18n`      | for i18n (internationalization) commit            |
|      `a11y`      | for a11y (accessibility) commit                   |
|    `refactor`    | for refactoring commit                            |
|      `docs`      | for documentation commit                          |
|    `example`     | for example code commit                           |
|      `test`      | for testing commit                                |
|      `deps`      | for dependencies upgrading or downgrading commit  |
|     `config`     | for configuration commit                          |
|     `build`      | for packaging or bundling commit                  |
|    `release`     | for publishing commit                             |
|      `wip`       | for work in progress commit                       |
|     `chore`      | for other operations commit                       |

### Emojis to use

|            Emoji            | Raw Emoji Code                | Type                      | Description                                            |
| :-------------------------: | ----------------------------- | ------------------------- | ------------------------------------------------------ |
|           :star:            | `:star:`                      | `new` or `feat / feature` | add **new feature**                                    |
|            :bug:            | `:bug:`                       | `bug`                     | fix **bug** issue                                      |
|         :ambulance:         | `:ambulance:`                 | `bug`                     | ciritial hotfix **bug** issue                          |
|           :lock:            | `:lock:`                      | `security`                | fix **security** issue                                 |
| :chart_with_upwards_trend:  | `:chart_with_upwards_trend:`  | `performance`             | fix **performance** issue                              |
|            :zap:            | `:zap:`                       | `improvement`             | update **backwards-compatible** feature                |
|           :boom:            | `:boom`                       | `breaking`                | update **backwards-incompatible** feature              |
|          :warning:          | `:warning:`                   | `deprecated`              | **deprecate** feature                                  |
|   :globe_with_meridians:    | `:globe_with_meridians:`      | `i18n`                    | update or fix **internationalization**                 |
|        :wheelchair:         | `:wheelchair:`                | `a11y`                    | update or fix **accessibility**                        |
|      :rotating_light:       | `:rotating_light:`            | `refactor`                | remove **linter**/strict/deprecation warnings          |
|           :shirt:           | `:shirt:`                     | `refactor`                | **refactoring** or code **layouting**                  |
|     :white_check_mark:      | `:white_check_mark:`          | `test`                    | add **tests**, fix **tests** failur or **CI** building |
|          :pencil:           | `:pencil:`                    | `docs`                    | update **documentation**                               |
|         :copyright:         | `:copyright:`                 | `docs`                    | decide or change **license**                           |
|         :lollipop:          | `:lollipop:`                  | `example`                 | for **example** or **demo** codes                      |
|         :lipstick:          | `:lipstick:`                  | `update`                  | update **UI/Cosmetic**                                 |
|            :up:             | `:up:`                        | `update`                  | update **other**                                       |
|           :truck:           | `:truck:`                     | `update`                  | **move** or **rename** files, repository, ...          |
| :twisted_rightwards_arrows: | `:twisted_rightwards_arrows:` | `update`                  | merge **conflict resolution**                          |
|      :heavy_plus_sign:      | `:heavy_plus_sign:`           | `update`                  | **add** files, dependencies, ...                       |
|     :heavy_minus_sign:      | `:heavy_minus_sign:`          | `update`                  | **remove** files, dependencies, ...                    |
|            :on:             | `:on:`                        | `update`                  | **enable** feature and something ...                   |
|         :arrow_up:          | `:arrow_up:`                  | `deps`                    | upgrade **dependencies**                               |
|        :arrow_down:         | `:arrow_down:`                | `deps`                    | downgrade **dependencies**                             |
|          :pushpin:          | `:pushpin:`                   | `deps`                    | pin **dependencies**                                   |
|          :wrench:           | `:wrench:`                    | `config`                  | update **configuration**                               |
|          :package:          | `:package:`                   | `build`                   | **packaging** or **bundling** or **building**          |
|      :hatching_chick:       | `:hatching_chick:`            | `release`                 | **initial** commit                                     |
|       :confetti_ball:       | `:confetti_ball:`             | `release`                 | release **major** version                              |
|           :tada:            | `:tada:`                      | `release`                 | release **minor** version                              |
|         :sparkles:          | `:sparkles:`                  | `release`                 | release **patch** version                              |
|          :rocket:           | `:rocket:`                    | `release`                 | **deploy** to production enviroment                    |
|         :bookmark:          | `:bookmark:`                  | `release`                 | **tagged** with version label                          |
|           :back:            | `:back:`                      | `revert`                  | **revert** commiting                                   |
|       :construction:        | `:construction:`              | `wip`                     | **WIP** commiting                                      |

### Example 1 (single line commit message)

```
:star: feat: add new feature
^----^ ^---^ ^------------^
  |      |         |
  |      |         +-> Summary in present tense.
  |      |
  |      +-------> Type:
  |       chore, docs, feat, fix, refactor, style, test, etc.
  |
  +-------> Emoji:
  :tada: :bookmark: :sparkles: :bug: :books: :wrench: :truck:
```

Examples:

- `feat:` Add a new feature (equivalent to a MINOR in [Semantic Versioning](https://semver.org/)).

- `fix:` Fix a bug (equivalent to a PATCH in [Semantic Versioning](https://semver.org/)).

- `docs:` Documentation changes(update, delete, create documents).

- `style:` Code style change (formatting, missing semi colons, etc; no production code change.).

- `refactor:` Refactor code(refactoring production code, eg. renaming a variable).

- `perf:` Update code performances.

- `test:` Add test to an existing feature(adding missing tests, refactoring tests; no production code change).

- `chore:` Update something without impacting the user (updating grunt tasks bump a dependency in package.json. no production code change).

### Example 2(multi-line commit message)

All Commit Message Format **MUST** meet this Text Format:

```
[:<Emoji>: ][<Type>[(<Scope>)]: ]<Subject>
[<BLANK LINE>]
[<Message Body>]
[<BLANK LINE>]
[<Message Footer>]
```

### Scope

The scope could be anything specifying place or category of the commit change. For example $location, $browser, $compile, $rootScope, ngHref, ngClick, ngView, feature1, etc...

### Subject

The subject contains succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes"
- don't capitalize first letter
- no dot (.) at the end

### Message Body

Just as in the **Subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Message Footer

The Message Footer should contain any information about **Notes** and also Message Footer should be **recommended** [GitHub Issue](https://github.com/features#issues) ID Reference, Ex. `Issue #27`, `Fixes #1`, `Closes #2`, `Resolves #3`.

**Notes** should start with the word `NOTE:` with a space or two newlines. The rest of the commit message is then used for this.

Examples:

new:

```
:star: new(graphite): add 'graphiteWidth' option
```

bug fix:

```
:bug: fix(graphite): stop graphite breaking when width < 0.1

Closes #28
```

### TypeScript Style Guide

We use ESLint and Prettier to enforce a consistent coding style. Please ensure your code adheres to these standards before submitting a PR.

- Use 2 spaces for indentation
- Use semicolons at the end of statements
- Use single quotes for strings
- Prefer `const` over `let` when possible
- Always specify member accessibility (`public`/`private`/`protected`)
- Use PascalCase for type names
- Use PascalCase for enum values
- Use camelCase for function names
- Use camelCase for property names and local variables
- Use whole words in names when possible
- Prefix interfaces with `I`
- Use `undefined`, do not use `null`
- Use `type` for type aliases
- Use `interface` for public API's definition when authoring a library or 3rd-party ambient type definitions
- Use `type` for react component prop types
- Do not use `namespace`
- Use `enum` instead of `Object.freeze`
- Use `===` and `!==` over `==` and `!=`
- Use `Array<T>` over `T[]` for complex types
- Use arrow functions over anonymous function expressions
- Always surround loop and conditional bodies with curly braces
- Open curly braces always go on the same line as whatever necessitates them
- Parenthesized constructs should have no surrounding whitespace
- Use async/await over raw promises
- Use template strings instead of string concatenation
- Use object spread instead of `Object.assign` for shallow-cloning

Remember to use TypeScript-specific features:

- Utilize TypeScript's strict mode (`"strict": true` in `tsconfig.json`)
- Use type annotations for function parameters and return types
- Leverage TypeScript's advanced types (e.g., Partial, Readonly, Record)
- Use union types (`|`) and intersection types (`&`) where appropriate
- Utilize `typeof` and `keyof` operators for more dynamic typing

For React components:

- Use function components with hooks instead of class components
- Define prop types using interfaces or type aliases
- Use React.FC for functional components when you want to include children prop by default

### React Style Guide

- Use functional components and hooks
- Follow the [React Hooks documentation](https://reactjs.org/docs/hooks-intro.html) for best practices
- Use PropTypes for type checking

### Backend Style Guide

- Follow RESTful principles for API design
- Use async/await for asynchronous operations
- Implement proper error handling and logging

**Thank you for contributing to FlowLab!**

#### References:

- [https://gist.github.com/rishavpandey43/84665ffe3cea76400d8e5a1ad7133a79](https://gist.github.com/rishavpandey43/84665ffe3cea76400d8e5a1ad7133a79)
- [https://www.conventionalcommits.org/](https://www.conventionalcommits.org/)
- [https://seesparkbox.com/foundry/semantic_commit_messages](https://seesparkbox.com/foundry/semantic_commit_messages)
- [http://karma-runner.github.io/1.0/dev/git-commit-msg.html](http://karma-runner.github.io/1.0/dev/git-commit-msg.html)
- [https://dev.to/maxpou/enhance-your-git-log-with-conventional-commits-3ea4](https://dev.to/maxpou/enhance-your-git-log-with-conventional-commits-3ea4)
- [https://github.com/kazupon/git-commit-message-convention](https://github.com/kazupon/git-commit-message-convention)
