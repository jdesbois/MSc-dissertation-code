
// Global obj variables for current donor pool and returned matching object
var currentDataObj = null
var matchingObj = null

// Example data button logic (JQUERY since it was less complicated)
$('#graphDropdown a').click(function() {
    let graphSize = $(this)[0]['attributes']['value'].value
    if (graphSize === 'large') {
        currentDataObj = largeData
        buildNetwork(largeData)
    } else {
        currentDataObj = smallData
        buildNetwork(smallData)
    }
})

// Layout dropdown logic
const layoutDropdown = document.getElementById('layoutSelect')
layoutDropdown.addEventListener('change', () => {
})

/**
 * Function that deals with on click event for the graph
 */
network.on('click', (params) => {
    console.log(params)
})


// Reset graph button logic
const resetButton = document.getElementById('reset-button')
resetButton.addEventListener('click', () => {
    buildNetwork(currentDataObj)
})


// Matching request button logic
const matchingRequestButton = document.getElementById('matching-request')
const operationSelect = document.getElementById('operationSelect')
const chainSelect = document.getElementById('chainSelect')

matchingRequestButton.addEventListener('click', () => {
    let operation = operationSelect.value
    let chainLength = chainSelect.value
    makeMatchingRequest(currentDataObj, operation, chainLength).then(data => {
        window.matchingObj = data
        plotMatches(data)
        updateDescriptionData(data['output']['exchange_data'][0])
    })
})

// File upload button logic
const fileSelection = document.getElementById('file-selector')
fileSelection.addEventListener('change', (event) => {
    const reader = new FileReader();
    let fileType = event.target.files[0]['name'].split('.').pop().toLowerCase()

    reader.addEventListener('load', (event) => {
        let fileContent = event.target.result
        if (fileType === 'json') {
            currentDataObj = JSON.parse(fileContent)
            buildNetwork(currentDataObj)
        } else if (fileType === 'xml') {
            currentDataObj = readXMLFile(fileContent)
            buildNetwork(currentDataObj)
        } else {
            callAlertBanner(`${fileType} not currently supported`)
        }
    })
    reader.readAsText(event.target.files[0])

})

// Function: Updates the matching algorithm status data
function updateDescriptionData(exchange_data) {
    const matchingDesc = document.getElementById('matching-desc')
    matchingDesc.innerHTML = exchange_data['description']

    const numExchanges = document.getElementById('num-exchanges')
    const threeWays = document.getElementById('three-ways')
    const twoWays = document.getElementById('two-ways')
    const totalTransplants = document.getElementById('total-transplants')
    const weight = document.getElementById('weight')

    numExchanges.innerHTML = exchange_data['exchanges'].length 
    threeWays.innerHTML = exchange_data['three_way_exchanges']
    twoWays.innerHTML = exchange_data['two_way_exchanges']
    totalTransplants.innerHTML = exchange_data['total_transplants']
    weight.innerHTML = exchange_data['weight']

    console.log(exchange_data)
}

const printObject = document.getElementById('print-obj').addEventListener('click', () => {
    console.log(window.currentDataObj);
})

const addNode = document.getElementById('add-to-obj').addEventListener('click', ()=> {

})

/**
 * Function: Assigns event listener to Save XML nav entry
 * Makes a fetch post request to backend
 * resceives file to download in response
 * Creates a link document object
 * Assigns it file download information
 * triggers click event
 */
const saveXML = document.getElementById('save-xml').addEventListener('click', () => {
    const url = '/save-xml'
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(window.currentDataObj)
    })
    .then(response => response.blob())
    .then(blob => {
        const newURL = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = newURL
        a.download = 'donorPool.xml' || 'download'
        a.click()
    })
})

/**
 * Function: Assigns event listener to Save JSON nav entry
 * Makes a fetch post request to backend
 * resceives file to download in response
 * Creates a link document object
 * Assigns it file download information
 * triggers click event
 */
const saveJSON = document.getElementById('save-json').addEventListener('click', () => {
    const url = '/save-json'
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Accept': 'application/json, text/plain',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(window.currentDataObj)
    })
    .then(response => response.blob())
    .then(blob => {
        const newURL = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = newURL
        a.download = 'donorPool.xml' || 'download'
        a.click()
    })
})

/**
 * Function: Sets current data pool object to null
 * Clears out nodes and edges dataset 
 */
const deleteGraph = document.getElementById('delete-button')
deleteGraph.addEventListener('click', () => {
    nodes.clear()
    edges.clear()
    window.currentDataObj = null
})



const testXMLConvert = document.getElementById('convert-to-xml')
testXMLConvert.addEventListener('click', () => {
    let returnObject = createXMLDom(window.currentDataObj)
    let stringXML = createXMLString(currentDataObj)
    console.log(stringXML)
})