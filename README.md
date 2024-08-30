# Accounts Creator

This project is an automated tool for account creation that works with various services like WhatsApp, Telegram, and more. It allows you to buy/rent phone numbers, generate usernames, and verify email addresses.

## Features

- Retrieve a list of available numbers by country and service.
- Buy or rent phone numbers.
- Generate random usernames.
- Manage email verifications, including purchasing, viewing active purchases, and canceling.
- Check account balance and incoming emails.

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/Naeaerc20/Accounts-Creator.git
    ```
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Create a `.env` file:**
   - Add your `API_KEY` for SMS-Activate.
   - Example:
     ```
     API_KEY=your_sms_activate_api_key
     ```

## Usage

1. **Run the application:**
    ```bash
    node index.js
    ```
2. **Follow the on-screen instructions** to select the desired options.

## Examples

- **Get a WhatsApp number for Argentina:**
  1. Select "Get Number List"
  2. Select "Get Numbers"
  3. Enter the service code: `wa`
  4. Enter the country code: `54` (for Argentina)

- **Rent a number for Telegram in Mexico:**
  1. Select "Buy/Rent Phone Number"
  2. Select "Rent Phone Number"
  3. Enter the service code: `tg`
  4. Enter the country code: `52` (for Mexico)
  5. Enter the rental duration: `30` (e.g., for 30 minutes)

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
