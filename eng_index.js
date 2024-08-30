const colors = require('colors');
const fs = require('fs');
const readline = require('readline');
const figlet = require('figlet');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables from .env
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_URL = 'https://api.sms-activate.io/stubs/handler_api.php';
let apiKey = process.env.API_KEY;
let emailId = process.env.EMAIL_ID;

// Function to verify and request the API Key
const verifyApiKey = (callback) => {
    if (!apiKey) {
        rl.question(colors.white('\nPlease enter your SMS-Activate API Key: '), (key) => {
            apiKey = key.trim();
            fs.appendFileSync('.env', `API_KEY=${apiKey}\n`);
            console.log(colors.green('\n✅ API Key saved successfully.\n'));
            callback();
        });
    } else {
        callback();
    }
};

// Initial presentation
const presentation = () => {
    figlet.text('Accounts\nCreator', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    }, function(err, data) {
        if (err) {
            console.log('Error generating large text');
            console.dir(err);
            return;
        }
        console.log(colors.green(`\n${data}\n`));
        console.log(colors.green('Welcome to the Account Creator/Manager Client\n'));
        showMenu();
    });
};

// Main menu options
const showMenu = () => {
    console.log(colors.blue('🔢 1. Get General Information'));
    console.log(colors.green('📞 2. Rent a Phone Number'));
    console.log(colors.yellow('🔐 3. Receive Activation Code'));
    console.log(colors.magenta('👥 4. Generate Random Name and Username'));
    console.log(colors.cyan('📧 5. Manage Email Addresses'));
    console.log(colors.red('✉️  6. Check Incoming Emails'));
    console.log(colors.yellow('💰 7. Check Account Balance'));
    rl.question(colors.white('\nSelect an option: '), (option) => {
        executeOption(option);
    });
};

// Function to execute the selected option
const executeOption = (option) => {
    console.log('');
    switch(option) {
        case '1':
            subMenuOption1();
            break;
        case '2':
            rentPhoneNumber(); 
            break;
        case '3':
            receiveActivationCode();
            break;
        case '4':
            generateRandomName();
            break;
        case '5':
            emailSubMenu();
            break;
        case '6':
            checkIncomingEmails();
            break;
        case '7':
            checkBalance();
            break;
        default:
            console.log(colors.red('🚫 Invalid option. Please try again.\n'));
            showMenu();
    }
};

// Submenu for option 1
const subMenuOption1 = () => {
    console.log(colors.blue('1. Check Available Countries (getCountries)'));
    console.log(colors.blue('2. Check Available Operators (getOperators)'));
    console.log(colors.blue('3. Check Prices (getPrices)'));
    console.log(colors.blue('4. Get back to Main Menu'));
    rl.question(colors.white('\nSelect an option: '), (subOption) => {
        console.log('');
        switch(subOption) {
            case '1':
                verifyApiKey(() => checkCountries());
                break;
            case '2':
                verifyApiKey(() => checkOperators());
                break;
            case '3':
                verifyApiKey(() => checkPrices());
                break;
            case '4':
                showMenu();
                break;
            default:
                console.log(colors.red('🚫 Invalid option. Please try again.\n'));
                subMenuOption1();
        }
    });
};

// Function to check available countries
const checkCountries = () => {
    axios.get(`${API_URL}?action=getCountries&api_key=${apiKey}`)
        .then(response => {
            console.log(colors.green('\n🌍 Available Countries:\n'));
            const countries = response.data;
            Object.keys(countries).forEach(key => {
                const country = countries[key];
                console.log(colors.yellow(`ID: ${country.id} - Country: ${country.eng}`));
            });
            console.log('');
            subMenuOption1();
        })
        .catch(error => {
            console.log(colors.red('🚫 Error fetching countries:'), error);
            console.log('');
            subMenuOption1();
        });
};

// Function to check available operators
const checkOperators = () => {
    rl.question(colors.white('Enter the country code: '), (country) => {
        axios.get(`${API_URL}?action=getOperators&country=${country}&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green('\n📡 Available Operators:\n'));
                const operators = response.data.countryOperators[country];
                if (operators && operators.length > 0) {
                    operators.forEach(operator => {
                        console.log(colors.yellow(`- Operator: ${operator}`));
                    });
                } else {
                    console.log(colors.red('🚫 No operators available for this country.\n'));
                }
                console.log('');
                subMenuOption1();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error fetching operators:'), error);
                console.log('');
                subMenuOption1();
            });
    });
};

// Function to check prices
const checkPrices = () => {
    rl.question(colors.white('Enter the service name (e.g., wa for WhatsApp, tg for Telegram): '), (service) => {
        axios.get(`${API_URL}?action=getPricesVerification&service=${service}&api_key=${apiKey}`)
            .then(response => {
                if (response.data) {
                    console.log(colors.green(`\n💰 Available prices for the ${service} service:\n`));
                    const prices = response.data[service];
                    Object.keys(prices).forEach(country => {
                        const detail = prices[country];
                        console.log(colors.yellow(`Country: ${country}\nQuantity Available: ${detail.count}\nPrice: ${detail.price}`));
                    });
                } else {
                    console.log(colors.red('🚫 No prices available for this service.\n'));
                }
                console.log('');
                subMenuOption1();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error fetching prices:'), error);
                console.log('');
                subMenuOption1();
            });
    });
};

// Function to rent a phone number
const rentPhoneNumber = () => {
    rl.question(colors.white('Enter the service code (e.g., wa for WhatsApp): '), (service) => {
        rl.question(colors.white('Enter the country code: '), (country) => {
            axios.get(`${API_URL}?action=getNumber&service=${service}&country=${country}&api_key=${apiKey}`)
                .then(response => {
                    if (response.data.includes("NO_NUMBERS")) {
                        console.log(colors.red('\n🚫 No numbers available for this service and country.\n'));
                    } else {
                        const numberData = response.data.split(':');
                        const activationId = numberData[1];
                        const phoneNumber = numberData[2];
                        console.log(colors.green(`\n📞 Phone number obtained:\nACCESS_NUMBER: ${activationId}\nPHONE_NUMBER: ${phoneNumber}\n`));
                    }
                    console.log('');
                    showMenu();
                })
                .catch(error => {
                    console.log(colors.red('🚫 Error obtaining phone number:'), error);
                    console.log('');
                    showMenu();
                });
        });
    });
};

// Option 3: Receive activation code
const receiveActivationCode = () => {
    rl.question(colors.white('Enter the activation ID: '), (id) => {
        axios.get(`${API_URL}?action=getStatus&id=${id}&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green(`\n🔐 Activation status: ${response.data}\n`));
                console.log('');
                showMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error fetching activation status:'), error);
                console.log('');
                showMenu();
            });
    });
};

// Submenu for option 5: Manage Email Addresses
const emailSubMenu = () => {
    console.log(colors.blue('1. Purchase Email Verification'));
    console.log(colors.blue('2. Get Active Purchase List'));
    console.log(colors.blue('3. Cancel Email Purchase'));
    console.log(colors.blue('4. Get back to Main Menu'));
    rl.question(colors.white('\nSelect an option: '), (subOption) => {
        console.log('');
        switch(subOption) {
            case '1':
                getOfferList();
                break;
            case '2':
                getActivePurchaseList();
                break;
            case '3':
                cancelEmailPurchase();
                break;
            case '4':
                showMenu();
                break;
            default:
                console.log(colors.red('🚫 Invalid option. Please try again.\n'));
                emailSubMenu();
        }
    });
};

// Option 5.1: Get offer list
const getOfferList = () => {
    rl.question(colors.white('Enter the site for which you want to obtain email verification: '), (site) => {
        axios.get(`${API_URL}?action=getDomains&api_key=${apiKey}&site=${site}`)
            .then(response => {
                if (response.data.status === "OK") {
                    console.log(colors.green('🌍 Offer list obtained:\n'));
                    const offers = response.data.response.zones;
                    offers.forEach(offer => {
                        console.log(colors.yellow(`- Name: ${offer.name}, Cost: ${offer.cost}`));
                    });
                    console.log('');
                    purchaseEmailVerification(site);
                } else {
                    console.log(colors.red(`🚫 Error obtaining offer list: ${response.data.status}`));
                    console.log('');
                    emailSubMenu();
                }
            })
            .catch(error => {
                console.log(colors.red('🚫 Error obtaining offer list:'), error);
                console.log('');
                emailSubMenu();
            });
    });
};

// Option 5.2: Purchase email verification
const purchaseEmailVerification = (site) => {
    rl.question(colors.white('Enter the type of email (1 for domains, 2 for popular zones): '), (mail_type) => {
        rl.question(colors.white('Enter the email domain (e.g., mail.ru): '), (mail_domain) => {
            axios.get(`${API_URL}?action=buyMailActivation&site=${site}&mail_type=${mail_type}&mail_domain=${mail_domain}&api_key=${apiKey}`)
                .then(response => {
                    if (response.data.status === "OK") {
                        const email = response.data.response.email;
                        emailId = response.data.response.id;
                        fs.appendFileSync('.env', `EMAIL_ID=${emailId}\n`);
                        console.log(colors.green(`📧 Email purchased: ${email}`));
                        console.log('');
                        emailSubMenu();
                    } else {
                        console.log(colors.red(`🚫 Error purchasing email verification: ${response.data.status}`));
                        console.log('');
                        emailSubMenu();
                    }
                })
                .catch(error => {
                    console.log(colors.red('🚫 Error purchasing email verification:'), error);
                    console.log('');
                    emailSubMenu();
                });
        });
    });
};

// Option 5.3: Get active purchase list
const getActivePurchaseList = () => {
    axios.get(`${API_URL}?action=getMailHistory&page=1&per_page=10&api_key=${apiKey}`)
        .then(response => {
            if (response.data.status === "OK") {
                console.log(colors.green('📧 Active Purchase List:'));
                const purchases = response.data.response.list;
                purchases.forEach((purchase, index) => {
                    console.log(colors.yellow(`Purchase ${index + 1}:\nID: ${purchase.id}\nEmail: ${purchase.email}\nSite: ${purchase.site}\nStatus: ${purchase.status}\nDate: ${purchase.date}`));
                });
                console.log('');
                emailSubMenu();
            } else {
                console.log(colors.red('🚫 Error obtaining active purchase list.'));
                console.log('');
                emailSubMenu();
            }
        })
        .catch(error => {
            console.log(colors.red('🚫 Error obtaining active purchase list:'), error);
            console.log('');
            emailSubMenu();
        });
};

// Option 5.4: Cancel email purchase
const cancelEmailPurchase = () => {
    rl.question(colors.white('Enter the ID of the purchase to cancel: '), (id) => {
        axios.get(`${API_URL}?action=cancelMailActivation&id=${id}&api_key=${apiKey}`)
            .then(response => {
                if (response.data.status === "OK") {
                    console.log(colors.green('✅ Purchase canceled successfully.'));
                } else {
                    console.log(colors.red(`🚫 Error canceling the purchase: ${response.data.status}`));
                }
                console.log('');
                emailSubMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error canceling the purchase:'), error);
                console.log('');
                emailSubMenu();
            });
    });
};

// Option 6: Check Incoming Emails
const checkIncomingEmails = () => {
    if (!emailId) {
        console.log(colors.red('🚫 No email address saved. Please generate one first.'));
        console.log('');
        showMenu();
    } else {
        axios.get(`${API_URL}?action=checkMailActivation&id=${emailId}&api_key=${apiKey}`)
            .then(response => {
                if (response.data.status === "OK") {
                    const message = response.data.response.value;
                    if (typeof message === 'string' && message.trim()) {
                        console.log(colors.green('✉️  Incoming Emails:'));
                        console.log(colors.yellow(`Message content:\n${message}`));
                    } else {
                        console.log(colors.red('🚫 No messages in the inbox or the message format is unexpected.'));
                    }
                } else {
                    console.log(colors.red(`🚫 Error checking incoming emails: ${response.data.status}`));
                }
                console.log('');
                showMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error checking incoming emails:'), error);
                console.log('');
                showMenu();
            });
    }
};

// Option 7: Check account balance
const checkBalance = () => {
    verifyApiKey(() => {
        axios.get(`${API_URL}?action=getBalance&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green(`💰 Account balance: ${response.data}`));
                console.log('');
                showMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error checking account balance:'), error);
                console.log('');
                showMenu();
            });
    });
};

// Function to generate a random name, surname, and username
const generateRandomName = () => {
    const firstNamePath = './scripts/First_Name_DB.txt';
    const lastNamePath = './scripts/Last_Name_DB.txt';

    try {
        const firstNames = fs.readFileSync(firstNamePath, 'utf-8').split('\n');
        const lastNames = fs.readFileSync(lastNamePath, 'utf-8').split('\n');

        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)].trim();
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)].trim();

        const username = `${firstName}${lastName}${Math.floor(Math.random() * 10000)}`;

        console.log(colors.green('✅ Data Generated! Your details are:'));
        console.log(colors.blue(`🔹 First Name: ${firstName}`));
        console.log(colors.blue(`🔹 Last Name: ${lastName}`));
        console.log(colors.blue(`🔹 Username: ${username}`));

        rl.question(colors.white('Do you want to use these details? (Yes/No): '), (answer) => {
            if (answer.toLowerCase() === 'yes') {
                console.log(colors.green('🔄 Returning to the main menu...'));
                console.log('');
                showMenu();
            } else {
                console.log(colors.yellow('🔄 Generating new details...'));
                console.log('');
                generateRandomName(); 
            }
        });

    } catch (error) {
        console.log(colors.red('🚫 Error reading the first name or last name files. Please ensure the files exist and are in the correct path.'));
        console.log('');
        showMenu();
    }
};

// Start the program by showing the presentation and then the menu
presentation();
