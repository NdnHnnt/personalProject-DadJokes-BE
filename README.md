# DadJokes API

Welcome to the DadJokes API repository! This repository contains the backend code for an application that allows users to share and interact with dad jokes. The API is built using Node.js and Express.js.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm are installed on your system.
- MySQL or another compatible database is set up and configured.

## Installation

1. Clone this repository to your local machine.
2. Navigate to the repository folder in your terminal.
3. Install the required dependencies using `npm install`.

## Usage

1. Set up your environment variables by editing the `example.env` file and rename it into `.env` in the root of the project and populating it with your API keys and database information.

   Example `.env` file:

   ```
   DBUSERNAME = DB_USER_NAME
   DBHOST = DB_HOST
   DBPASSWORD = DB_PASSWORD
   DBDATABASE = DB_DATABASE
   SECRETTOKEN = YOUR_SECRET_TOKEN
   ```

2. Run the application using `npm start`.
3. The API should be running in `localhost:3000` and can be accessed through Postman.

## API Endpoints

### Users

- `GET /users`: Get user information. (requires Bearer Token)
- `POST /users/signup`: Sign up a new user.
- `POST /users/signin`: Sign in an existing user.

### Jokes
All of the processes below require Bearer Token after signin
- `GET /jokes`: Get a list of all jokes
- `POST /jokes`: Create a new joke.
- `GET /jokes/:jokesId`: Get details about a specific joke.
- `POST /jokes/:jokesId/like`: Like or unlike a joke. 
- `POST /jokes/:jokesId/comment`: Add a comment to a joke.
- `DELETE /jokes/:jokesId`: Delete a joke (must be the owner).
- `DELETE /jokes/:jokesId/comment/:commentId`: Delete a comment (must be the author).

## Security

Please make sure to keep your API keys and sensitive information secure. The `.env` file containing these details should never be pushed to version control.

## Contributing

Contributions are welcome! If you find any issues or have suggestions, feel free to create a pull request or open an issue in this repository.

## License

This project is licensed under the [MIT License](LICENSE).

---

Happy coding! If you have any questions or need further assistance, feel free to reach out.
