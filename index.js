const colors = require('colors');
const fs = require('fs');
const readline = require('readline');
const figlet = require('figlet');
const dotenv = require('dotenv');
const axios = require('axios');

// Cargar variables de entorno desde .env
dotenv.config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_URL = 'https://api.sms-activate.io/stubs/handler_api.php';
let apiKey = process.env.API_KEY;
let emailId = process.env.EMAIL_ID;

// Función para verificar y solicitar la API Key
const verificarApiKey = (callback) => {
    if (!apiKey) {
        rl.question(colors.white('\nPor favor, ingrese su API Key de SMS-Activate: '), (key) => {
            apiKey = key.trim();
            fs.appendFileSync('.env', `API_KEY=${apiKey}\n`);
            console.log(colors.green('\n✅ API Key guardada correctamente.\n'));
            callback();
        });
    } else {
        callback();
    }
};

// Presentación inicial
const presentacion = () => {
    figlet.text('Accounts\nCreator', {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
    }, function(err, data) {
        if (err) {
            console.log('Error generando el texto en grande');
            console.dir(err);
            return;
        }
        console.log(colors.green(`\n${data}\n`));
        console.log(colors.green('Bienvenido al Cliente Creador/Administrador de Cuentas\n'));
        mostrarMenu();
    });
};

// Menú de opciones
const mostrarMenu = () => {
    console.log(colors.blue('🔢 1. Obtener Información General'));
    console.log(colors.green('📞 2. Alquilar Número de Teléfono'));
    console.log(colors.yellow('🔐 3. Recibir Código de Activación'));
    console.log(colors.magenta('👥 4. Generar Nombre y Usuario Aleatorio'));
    console.log(colors.cyan('📧 5. Administrar Correos Electrónicos'));
    console.log(colors.red('✉️  6. Verificar Correos Entrantes'));
    console.log(colors.yellow('💰 7. Verificar Saldo de Cuenta'));
    rl.question(colors.white('\nSelecciona una opción: '), (opcion) => {
        ejecutarOpcion(opcion);
    });
};

// Función para ejecutar la opción seleccionada
const ejecutarOpcion = (opcion) => {
    console.log('');
    switch(opcion) {
        case '1':
            subMenuOpcion1();
            break;
        case '2':
            alquilarNumeroTelefono(); 
            break;
        case '3':
            recibirCodigoActivacion();
            break;
        case '4':
            generarNombreUsuario();
            break;
        case '5':
            subMenuCorreos();
            break;
        case '6':
            verificarLlegadaCorreo();
            break;
        case '7':
            verificarSaldo();
            break;
        default:
            console.log(colors.red('🚫 Opción no válida. Inténtalo de nuevo.\n'));
            mostrarMenu();
    }
};

// Submenú para la opción 1
const subMenuOpcion1 = () => {
    console.log(colors.blue('1. Consultar Países Disponibles (getCountries)'));
    console.log(colors.blue('2. Consultar Operadores Disponibles (getOperators)'));
    console.log(colors.blue('3. Consultar Precios (getPrices)'));
    console.log(colors.blue('4. Volver al Menú Principal'));
    rl.question(colors.white('\nSelecciona una opción: '), (subOpcion) => {
        console.log('');
        switch(subOpcion) {
            case '1':
                verificarApiKey(() => consultarPaises());
                break;
            case '2':
                verificarApiKey(() => consultarOperadores());
                break;
            case '3':
                verificarApiKey(() => consultarPrecios());
                break;
            case '4':
                mostrarMenu();
                break;
            default:
                console.log(colors.red('🚫 Opción no válida. Inténtalo de nuevo.\n'));
                subMenuOpcion1();
        }
    });
};

// Función para consultar países disponibles
const consultarPaises = () => {
    axios.get(`${API_URL}?action=getCountries&api_key=${apiKey}`)
        .then(response => {
            console.log(colors.green('\n🌍 Países disponibles:\n'));
            const countries = response.data;
            Object.keys(countries).forEach(key => {
                const country = countries[key];
                console.log(colors.yellow(`ID: ${country.id} - País: ${country.eng}`));
            });
            console.log('');
            subMenuOpcion1();
        })
        .catch(error => {
            console.log(colors.red('🚫 Error al consultar los países: '), error);
            console.log('');
            subMenuOpcion1();
        });
};

// Función para consultar operadores disponibles
const consultarOperadores = () => {
    rl.question(colors.white('Ingrese el código del país: '), (country) => {
        axios.get(`${API_URL}?action=getOperators&country=${country}&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green('\n📡 Operadores disponibles:\n'));
                const operators = response.data.countryOperators[country];
                if (operators && operators.length > 0) {
                    operators.forEach(operator => {
                        console.log(colors.yellow(`- Operador: ${operator}`));
                    });
                } else {
                    console.log(colors.red('🚫 No hay operadores disponibles para este país.\n'));
                }
                console.log('');
                subMenuOpcion1();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al consultar los operadores: '), error);
                console.log('');
                subMenuOpcion1();
            });
    });
};

// Función para consultar precios
const consultarPrecios = () => {
    rl.question(colors.white('Ingrese el nombre del servicio (e.g., wa para WhatsApp, tg para Telegram): '), (service) => {
        axios.get(`${API_URL}?action=getPricesVerification&service=${service}&api_key=${apiKey}`)
            .then(response => {
                if (response.data) {
                    console.log(colors.green(`\n💰 Precios disponibles para el servicio ${service}:\n`));
                    const precios = response.data[service];
                    Object.keys(precios).forEach(country => {
                        const detalle = precios[country];
                        console.log(colors.yellow(`País: ${country}\nCantidad Disponible: ${detalle.count}\nPrecio: ${detalle.price}`));
                    });
                } else {
                    console.log(colors.red('🚫 No hay precios disponibles para este servicio.\n'));
                }
                console.log('');
                subMenuOpcion1();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al consultar los precios: '), error);
                console.log('');
                subMenuOpcion1();
            });
    });
};

// Función para alquilar un número de teléfono
const alquilarNumeroTelefono = () => {
    rl.question(colors.white('Ingrese el código del servicio (e.g., wa para WhatsApp): '), (service) => {
        rl.question(colors.white('Ingrese el código del país: '), (country) => {
            axios.get(`${API_URL}?action=getNumber&service=${service}&country=${country}&api_key=${apiKey}`)
                .then(response => {
                    if (response.data.includes("NO_NUMBERS")) {
                        console.log(colors.red('\n🚫 No hay números disponibles para este servicio y país.\n'));
                    } else {
                        const numberData = response.data.split(':');
                        const activationId = numberData[1];
                        const phoneNumber = numberData[2];
                        console.log(colors.green(`\n📞 Número de teléfono obtenido:\nACCESS_NUMBER: ${activationId}\nPHONE_NUMBER: ${phoneNumber}\n`));
                    }
                    console.log('');
                    mostrarMenu();
                })
                .catch(error => {
                    console.log(colors.red('🚫 Error al obtener el número de teléfono: '), error);
                    console.log('');
                    mostrarMenu();
                });
        });
    });
};

// Opción 3: Recibir código de activación
const recibirCodigoActivacion = () => {
    rl.question(colors.white('Ingrese el ID de la activación: '), (id) => {
        axios.get(`${API_URL}?action=getStatus&id=${id}&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green(`\n🔐 Estado de la activación: ${response.data}\n`));
                console.log('');
                mostrarMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al obtener el estado de la activación: '), error);
                console.log('');
                mostrarMenu();
            });
    });
};

// Submenú para la opción 5: Administrar Correos Electrónicos
const subMenuCorreos = () => {
    console.log(colors.blue('1. Comprar Verificación por Correo'));
    console.log(colors.blue('2. Obtener Lista de Compras Activas'));
    console.log(colors.blue('3. Cancelar Compra por Correo'));
    console.log(colors.blue('4. Volver al Menú Principal'));
    rl.question(colors.white('\nSelecciona una opción: '), (subOpcion) => {
        console.log('');
        switch(subOpcion) {
            case '1':
                obtenerListaDeOfertas();
                break;
            case '2':
                obtenerListaDeComprasActivas();
                break;
            case '3':
                cancelarCompraCorreo();
                break;
            case '4':
                mostrarMenu();
                break;
            default:
                console.log(colors.red('🚫 Opción no válida. Inténtalo de nuevo.\n'));
                subMenuCorreos();
        }
    });
};

// Opción 5.1: Obtener lista de ofertas
const obtenerListaDeOfertas = () => {
    rl.question(colors.white('Introduce el sitio para el cual quieres obtener la verificación de correo: '), (site) => {
        axios.get(`${API_URL}?action=getDomains&api_key=${apiKey}&site=${site}`)
            .then(response => {
                if (response.data.status === "OK") {
                    console.log(colors.green('🌍 Lista de ofertas obtenida:'));
                    const ofertas = response.data.response.zones;
                    ofertas.forEach(oferta => {
                        console.log(colors.yellow(`- Nombre: ${oferta.name}, Costo: ${oferta.cost}`));
                    });
                    console.log('');
                    comprarVerificacionCorreo(site);
                } else {
                    console.log(colors.red(`🚫 Error al obtener la lista de ofertas: ${response.data.status}`));
                    console.log('');
                    subMenuCorreos();
                }
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al obtener la lista de ofertas:'), error);
                console.log('');
                subMenuCorreos();
            });
    });
};

// Opción 5.2: Comprar verificación por correo
const comprarVerificacionCorreo = (site) => {
    rl.question(colors.white('Introduce el tipo de correo (1 para dominios, 2 para zonas populares): '), (mail_type) => {
        rl.question(colors.white('Introduce el dominio del correo (ej: mail.ru): '), (mail_domain) => {
            axios.get(`${API_URL}?action=buyMailActivation&site=${site}&mail_type=${mail_type}&mail_domain=${mail_domain}&api_key=${apiKey}`)
                .then(response => {
                    if (response.data.status === "OK") {
                        const email = response.data.response.email;
                        emailId = response.data.response.id;
                        fs.appendFileSync('.env', `EMAIL_ID=${emailId}\n`);
                        console.log(colors.green(`📧 Correo comprado: ${email}`));
                        console.log('');
                        subMenuCorreos();
                    } else {
                        console.log(colors.red(`🚫 Error al comprar la verificación de correo: ${response.data.status}`));
                        console.log('');
                        subMenuCorreos();
                    }
                })
                .catch(error => {
                    console.log(colors.red('🚫 Error al comprar la verificación de correo:'), error);
                    console.log('');
                    subMenuCorreos();
                });
        });
    });
};

// Opción 5.3: Obtener lista de compras activas
const obtenerListaDeComprasActivas = () => {
    axios.get(`${API_URL}?action=getMailHistory&page=1&per_page=10&api_key=${apiKey}`)
        .then(response => {
            if (response.data.status === "OK") {
                console.log(colors.green('📧 Lista de Compras Activas:'));
                const compras = response.data.response.list;
                compras.forEach((compra, index) => {
                    console.log(colors.yellow(`Compra ${index + 1}:\nID: ${compra.id}\nCorreo: ${compra.email}\nSitio: ${compra.site}\nEstado: ${compra.status}\nFecha: ${compra.date}`));
                });
                console.log('');
                subMenuCorreos();
            } else {
                console.log(colors.red('🚫 Error al obtener la lista de compras activas.'));
                console.log('');
                subMenuCorreos();
            }
        })
        .catch(error => {
            console.log(colors.red('🚫 Error al obtener la lista de compras activas:'), error);
            console.log('');
            subMenuCorreos();
        });
};

// Opción 5.4: Cancelar compra por correo
const cancelarCompraCorreo = () => {
    rl.question(colors.white('Introduce el ID de la compra a cancelar: '), (id) => {
        axios.get(`${API_URL}?action=cancelMailActivation&id=${id}&api_key=${apiKey}`)
            .then(response => {
                if (response.data.status === "OK") {
                    console.log(colors.green('✅ Compra cancelada con éxito.'));
                } else {
                    console.log(colors.red(`🚫 Error al cancelar la compra: ${response.data.status}`));
                }
                console.log('');
                subMenuCorreos();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al cancelar la compra:'), error);
                console.log('');
                subMenuCorreos();
            });
    });
};

// Opción 6: Verificar Correos Entrantes
const verificarLlegadaCorreo = () => {
    if (!emailId) {
        console.log(colors.red('🚫 No hay ninguna dirección de correo guardada. Por favor, genera una primero.'));
        console.log('');
        mostrarMenu();
    } else {
        axios.get(`${API_URL}?action=checkMailActivation&id=${emailId}&api_key=${apiKey}`)
            .then(response => {
                if (response.data.status === "OK") {
                    const mensaje = response.data.response.value;
                    if (typeof mensaje === 'string' && mensaje.trim()) {
                        console.log(colors.green('✉️  Correos recibidos:'));
                        console.log(colors.yellow(`Contenido del mensaje:\n${mensaje}`));
                    } else {
                        console.log(colors.red('🚫 No hay mensajes en la bandeja de entrada o el formato del mensaje es inesperado.'));
                    }
                } else {
                    console.log(colors.red(`🚫 Error al verificar la llegada de correos: ${response.data.status}`));
                }
                console.log('');
                mostrarMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al verificar la llegada de correos:'), error);
                console.log('');
                mostrarMenu();
            });
    }
};

// Opción 7: Verificar saldo de cuenta
const verificarSaldo = () => {
    verificarApiKey(() => {
        axios.get(`${API_URL}?action=getBalance&api_key=${apiKey}`)
            .then(response => {
                console.log(colors.green(`💰 Saldo de cuenta: ${response.data}`));
                console.log('');
                mostrarMenu();
            })
            .catch(error => {
                console.log(colors.red('🚫 Error al verificar el saldo de la cuenta:'), error);
                console.log('');
                mostrarMenu();
            });
    });
};

// Función para generar un nombre, apellido y usuario aleatorio
const generarNombreUsuario = () => {
    const firstNamePath = './scripts/First_Name_DB.txt';
    const lastNamePath = './scripts/Last_Name_DB.txt';

    try {
        const nombres = fs.readFileSync(firstNamePath, 'utf-8').split('\n');
        const apellidos = fs.readFileSync(lastNamePath, 'utf-8').split('\n');

        const nombre = nombres[Math.floor(Math.random() * nombres.length)].trim();
        const apellido = apellidos[Math.floor(Math.random() * apellidos.length)].trim();

        const usuario = `${nombre}${apellido}${Math.floor(Math.random() * 10000)}`;

        console.log(colors.green('✅ Datos Generados! Sus datos son:'));
        console.log(colors.blue(`🔹 Nombre: ${nombre}`));
        console.log(colors.blue(`🔹 Apellido: ${apellido}`));
        console.log(colors.blue(`🔹 Usuario: ${usuario}`));

        rl.question(colors.white('¿Deseas usar estos datos? (Si/No): '), (respuesta) => {
            if (respuesta.toLowerCase() === 'si') {
                console.log(colors.green('🔄 Volviendo al menú principal...'));
                console.log('');
                mostrarMenu();
            } else {
                console.log(colors.yellow('🔄 Generando nuevos datos...'));
                console.log('');
                generarNombreUsuario(); 
            }
        });

    } catch (error) {
        console.log(colors.red('🚫 Error al leer los archivos de nombres o apellidos. Verifique que los archivos existen y están en la ruta correcta.'));
        console.log('');
        mostrarMenu();
    }
};

// Iniciar el programa mostrando la presentación y luego el menú
presentacion();
