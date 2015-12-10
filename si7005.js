var i2c = require('i2c-bus');

var ADDRESS = 0x40;
var STATUS = 0x00;
var STATUS_OK = 0x01;
var CONFIG = 0x03;
var CMD_READ_TEMPERATURE = 0x11;
var CMD_READ_HUMIDITY = 0x01;
var DATAH = 0x01;
var DATAL = 0x02;

module.exports = Si7005;

// function(bus) {
//     var device = new Si7005(bus);
// };

/* Capteur Si7005 on I2C bus */
function Si7005(bus) {
  this.i2c_bus = i2c.openSync(bus);
};

Si7005.prototype.readData = function(cmd){
    /* Ask for a command conversion */
    this.i2c_bus.writeByteSync(ADDRESS, CONFIG, cmd);
    
    /* Waiting until status ready (== STATUS_OK) */
    while (this.i2c_bus.readByteSync(ADDRESS, STATUS) & STATUS_OK){
    }

    /* Read data h and data l */
    var datah = this.i2c_bus.readByteSync(ADDRESS, DATAH);
    var datal = this.i2c_bus.readByteSync(ADDRESS, DATAL);
    return (datah << 8) + datal;
};


Si7005.prototype.readTemp = function(){
    var rawData = this.readData(CMD_READ_TEMPERATURE);
    /* Convert raw data to temperature */
    return ((rawData >> 2) / 32) - 50;
};

/* Read Humidity, temp parameter allow to evaluate RH with temperature compensation.
   no temp, => no temperature compensation */
Si7005.prototype.readHumidity = function(temp){
    var rawData = this.readData(CMD_READ_HUMIDITY);
    /* Convert raw data to humidity */
    var RHValue = ((rawData >> 4) / 16) - 24;
    /* Linearization: */
    var RHLinear = RHValue -(RHValue * RHValue * -0.00393 + RHValue * 0.4008 - 4.7844);
    /* Temperature compensation */
    /* Given the formula, 30°C = no temperature compensation */
    temp = typeof temp !== 'undefined' ? temp : 30;
    var RHTempCompensate = RHLinear + (temp - 30) * (RHLinear * 0.00237 + 0.1973)
    return RHTempCompensate;
};


/*
var si7005 = new Si7005(1);

var temp = si7005.readTemp();
var hm = si7005.readHumidity(temp);

console.log("Temperature: " + temp.toFixed(2) + "°C");
console.log("Humidity   : " + hm.toFixed(2) + "%");

*/
