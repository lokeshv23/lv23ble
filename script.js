const button = document.getElementById("getDetails");
const tempUnit = document.getElementById("tempUnit");
const tempReading = document.getElementById("tempReading");
let thermoService = null;

button.addEventListener("click", async () => {
  try {
    const device = await navigator.bluetooth.requestDevice({
      optionalServices: ["device_information","00000001-710e-4a5b-8d75-3e5b444bc3cf"],
      acceptAllDevices: true,
    });

    let deviceName = device.gatt.device.name;
        //alert("Connecting To "+deviceName+ ".. It may take couple of seconds more..");
    const server = await device.gatt.connect(); 

    thermoService = await server.getPrimaryService("00000001-710e-4a5b-8d75-3e5b444bc3cf");    

    /*const infoCharacteristics = await thermoService.getCharacteristics();
        console.log(infoCharacteristics);
        let infoValues = [];
        const promise = new Promise((resolve, reject) => {
          infoCharacteristics.forEach(async (characteristic, index, array) => {
            // Returns a buffer
            const value = await characteristic.readValue();
            console.log(new TextDecoder().decode(value));
            // Convert the buffer to string
            infoValues.push(new TextDecoder().decode(value));
            if (index === array.length - 1) resolve();
          });
        });*/

    const unitCharacteristic = await thermoService.getCharacteristic("00000003-710e-4a5b-8d75-3e5b444bc3cf");
    const unitValue = await unitCharacteristic.readValue();
    tempUnit.innerHTML = "Temperature Unit : "+ new TextDecoder().decode(unitValue);
    
    //Notify
    await thermoService.getCharacteristic("00000002-710e-4a5b-8d75-3e5b444bc3cf")
        .then(mychars => {
            myCharacteristic = mychars;
            return myCharacteristic.startNotifications().then(_ => {
              console.log('> Notifications started');
              myCharacteristic.addEventListener('characteristicvaluechanged',
                  handleNotifications);
            });
          })        
        .catch(err => {console.log(err)})

  }catch(err) {
      console.error(err);
      alert("An error occured while fetching device details");
    }
})


function handleNotifications(event) {
  let value = event.target.value;
  let a = [];
  let intValue = parseInt(new TextDecoder().decode(value));
  if (intValue > 140)
    tempReading.innerHTML = "Temperature Value : <span style=color:red><b>"+ intValue+"</b></span>";
  else
    tempReading.innerHTML = "Temperature Value : <span style=color:green><b>"+ intValue+"</b></span>";
}