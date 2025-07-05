#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const pricesFile = path.join(__dirname, 'assets/data/prices.json');

// Función para leer el archivo de precios actual
function readPrices() {
    try {
        const data = fs.readFileSync(pricesFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error leyendo archivo de precios:', error.message);
        return {};
    }
}

// Función para escribir el archivo de precios
function writePrices(prices) {
    try {
        const data = JSON.stringify(prices, null, 2);
        fs.writeFileSync(pricesFile, data);
        console.log('✅ Precios actualizados correctamente');
    } catch (error) {
        console.error('Error escribiendo archivo de precios:', error.message);
    }
}

// Función para actualizar un precio específico
function updatePrice(productId, currentPrice, originalPrice = null, discount = null) {
    const prices = readPrices();
    
    prices[productId] = {
        current: currentPrice.toString(),
        original: originalPrice ? originalPrice.toString() : null,
        discount: discount,
        lastUpdate: new Date().toISOString()
    };
    
    writePrices(prices);
    console.log(`✅ Precio actualizado para ${productId}: AED ${currentPrice}`);
}

// Función para mostrar todos los precios
function showPrices() {
    const prices = readPrices();
    console.log('\n📊 Precios actuales:');
    console.log('==================');
    
    for (const [productId, data] of Object.entries(prices)) {
        console.log(`${productId}:`);
        console.log(`  Precio actual: AED ${data.current}`);
        if (data.original) {
            console.log(`  Precio original: AED ${data.original}`);
        }
        if (data.discount) {
            console.log(`  Descuento: ${data.discount}`);
        }
        console.log(`  Última actualización: ${new Date(data.lastUpdate).toLocaleString()}`);
        console.log('');
    }
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('🔧 Herramienta de actualización de precios');
    console.log('==========================================');
    console.log('');
    console.log('Uso:');
    console.log('  node update-prices.js show                    - Mostrar todos los precios');
    console.log('  node update-prices.js update <id> <precio>    - Actualizar precio de un producto');
    console.log('  node update-prices.js update <id> <precio> <original> <descuento>');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node update-prices.js show');
    console.log('  node update-prices.js update switch2 2144.80 2899.00 -26%');
    console.log('  node update-prices.js update procontroller 347.97');
    console.log('');
    console.log('IDs de productos disponibles:');
    console.log('  - walkingpad');
    console.log('  - roborock');
    console.log('  - wemart');
    console.log('  - switch2');
    console.log('  - procontroller');
    console.log('  - sandisk-switch2-sd');
} else if (args[0] === 'show') {
    showPrices();
} else if (args[0] === 'update' && args.length >= 3) {
    const productId = args[1];
    const currentPrice = args[2];
    const originalPrice = args[3] || null;
    const discount = args[4] || null;
    
    updatePrice(productId, currentPrice, originalPrice, discount);
} else {
    console.error('❌ Argumentos incorrectos. Usa "node update-prices.js" para ver la ayuda.');
} 