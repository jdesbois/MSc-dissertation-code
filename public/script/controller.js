
// Global obj variables for current donor pool and returned matching object
var currentDataObj = null
var matchingObj = null

// Example data button logic (JQUERY since it was less complicated)
$('#graphDropdown a').click(function() {
    let graphSize = $(this)[0]['attributes']['value'].value
    currentDataObj = null
    if (graphSize === 'large') {
        currentDataObj = largeData
    } else if (graphSize === 'small') {
        currentDataObj = smallData
    } else {
        currentDataObj = multipleDonor
    }
    buildNetwork(window.currentDataObj)
})

// Layout dropdown logic
const layoutDropdown = document.getElementById('layoutSelect')
layoutDropdown.addEventListener('change', () => {
})

/**
 * Function that deals with on click event for the graph
 */
network.on('click', (params) => {
    // console.log(params)
    // Clears information display before displaying new information
    clearSelectionInfo()

    if (params['nodes'][0]) {
        displaySelectedNodeInfo(params)
    }

    if (!params['nodes'][0] && params['edges'][0]) {
        displaySelectedEdgeInfo(params)
    } 

})

// Display selected node information
function displaySelectedNodeInfo(params) {
    let node = nodes.get(params['nodes'][0])
    let innerString = `Donor: ${node['id']}<br/>
                       Recipient: ${node['patient']}<br/>
                       Donor age: ${node['dage']}<br/>`;

    if (window.currentDataObj['data'][node.id]['altruistic']) {
        innerString += "\nAltruistic: True"
    } else {
        innerString += "\nAltruistic: False"
    }

    document.getElementById('selected-item-display').innerHTML = innerString
}

// Displays information about selected edge
function displaySelectedEdgeInfo(params) {
    let innerString = `Edge ID: ${params['edges'][0]} <br />
                       Score: ${edges.get(params['edges'][0])['score']}`
    document.getElementById('selected-item-display').innerHTML = innerString
}

// Reset graph button logic
/**
 * Event listener for reset graph button
 * Calls buildnetork function on current data obj
 */
const resetButton = document.getElementById('reset-button')
resetButton.addEventListener('click', () => {
    buildNetwork(window.currentDataObj)
})

/**
 * Random graph nav button logic
 * Adds event listener to nav bar button
 * Adds event listener to Save Button
 * Takes num of nodes input 
 * Calls generate random graph
 */
const randomGraphButton = document.getElementById('randomGraph-button')
randomGraphButton.addEventListener('click', () => {
    $('#random-graph-modal').modal('show')
    document.getElementById('randomGraphSave').onclick = generateRandomGraph.bind()
})
/**
 * Event listenere for help button on nav bar
 * Shows modal when pressed
 */
const helpButton = document.getElementById('help-button')
helpButton.addEventListener('click', () => {
    $('#help-modal').modal('show')
})
/**
 * Event listener for about button on nav bar
 * Shows modal when pressed
 */
const aboutButton = document.getElementById('about-button')
aboutButton.addEventListener('click', () => {
    $('#about-modal').modal('show')
})
// Set Colour button logic 
const setLayoutButton = document.getElementById('set-layout-options')
setLayoutButton.addEventListener('click', () => {
    if (window.currentDataObj === null) {
        callAlertBanner("Please build/input a graph first")
        return
    }
    buildNetwork(currentDataObj)
})

// Matching request button logic
const matchingRequestButton = document.getElementById('matching-request')
const operationSelect = document.getElementById('operationSelect')
const chainSelect = document.getElementById('chainSelect')

matchingRequestButton.addEventListener('click', () => {
    network.disableEditMode()
    let operation = operationSelect.value
    let chainLength = chainSelect.value
    // Checks to make sure there is current data to send to algorithm
    if (currentDataObj === null) {
        callAlertBanner("No graph data present")
        return
    }
    // Disbales run button and produces working update to show user that function is running
    matchingRequestButton.disabled = true
    matchingRequestButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
    // document.getElementById('matching-request-running').innerHTML = `<strong> Working... </strong>`
    // Calls matching request function with selected criteria and current data object
    makeMatchingRequest(currentDataObj, operation, chainLength)
    //Once promise returns, the matching data is assigned to the global matching object
    //Plot matches and update description is then called
    .then(data => {
        console.log(data)

        matchingRequestButton.disabled = false
        matchingRequestButton.innerHTML = `Run`
        if (data['error']) {
            callAlertBanner(data['error'])
            return
        }

        window.matchingObj = data
        plotMatches(data)
        updateDescriptionData(data['output']['exchange_data'][0])

    })
})

// File upload button logic
/**
 * Function: Assigns an event listener to the file selection button
 * When the file selection button has changed i.e. user selected a file
 * FileReader is created, file type found and a load event is created on file reader
 * Once the file is loaded/read it is passed to the relevant parser to be converted to a workable object
 * read as Text is then called on file read with file name in order to trigger event
 */
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
/**
 * 
 * Function: Updates the matching algorithm status data
 * @param {*} exchange_data 
 */
function updateDescriptionData(exchange_data) {
    const matchingDesc = document.getElementById('matching-desc')
    matchingDesc.innerHTML = exchange_data['description']

    let numExchanges = exchange_data['exchanges'].length
    let threeWayExchanges = exchange_data['three_way_exchanges']
    let twoWayExchanges = exchange_data['two_way_exchanges']
    let totalTransplants = exchange_data['total_transplants']
    let weight = exchange_data['weight']

    let exchangeDataSting = `Number of exchanges: ${numExchanges} <br />
                             Three way exchanges: ${threeWayExchanges} <br />
                             Two way exchanges: ${twoWayExchanges} <br />
                             Total transplants: ${totalTransplants} <br />
                             Weight: ${weight} <br />`

    document.getElementById('exchange-data-body').innerHTML = exchangeDataSting
    console.log(exchange_data)
}



/**
 * Function: Assigns event listener to Save XML nav entry, calls saveXMLFile from api.js
*/
const saveXML = document.getElementById('save-xml').addEventListener('click', saveXMLFile)

/**
 * Function: Assigns event listener to Save JSON nav entry, calls saveJSONFile from api.js

 */
const saveJSON = document.getElementById('save-json').addEventListener('click', saveJSONFile)


/**
 * Function: Assigns event listener to save to Image button, calls saveImgFile from api.js
 */
const saveImageButton = document.getElementById('save-image').addEventListener('click', saveImgFile)


/**
 * Function: Sets current data pool object to null
 * Clears out nodes and edges dataset 
 */
const deleteGraph = document.getElementById('delete-button')
deleteGraph.addEventListener('click', () => {
    edges.remove(edges.get())
    nodes.remove(nodes.get())

    edges.clear()
    nodes.clear()
    window.currentDataObj = null
    window.matchingObj = null
})
/** 
 * Switches patient ID in node modal on and off when altruistic checkbox is changed 
 */
const altruisticCheckbox = document.getElementById('altruistic-input')
altruisticCheckbox.addEventListener('change', (event) => {
    console.log(event)
    if (altruisticCheckbox.checked) {
        document.getElementById('patient-input').value = ""
        document.getElementById('patient-input').disabled = true
    } else {
        document.getElementById('patient-input').disabled = false
    }
})

/**
 * Event Listener that turns of edit mode when closing the Node Modal
 * This is to fix a bug that caused the edit panel to not dissappear when exiting the modal
 */

const modalCloseButton = document.getElementById('modal-close-button')
modalCloseButton.addEventListener('click', ()  => {
    network.disableEditMode()
})

/**
 * Functions that clears data such as matching criteria, exchange data, selected item info
 */
// Master function that calls all clearing functions
function resetPageDataInfo() {
    clearSelectionInfo()
    clearExchangeData()
    clearMatchingCriteria()
}
// Clears selection info when click occurs on graph
function clearSelectionInfo() {
    document.getElementById('selected-item-display').innerHTML = ""
}

// Clears matching criteria data
function clearMatchingCriteria() {
    document.getElementById('matching-desc').innerHTML = ""
}

function clearExchangeData() {
    document.getElementById('exchange-data-body').innerHTML = ""
}

// /**
//  * TESTING AREA FUNCTION TO BE REMOVED
//  */
// const testXMLConvert = document.getElementById('convert-to-xml')
// testXMLConvert.addEventListener('click', () => {
//     network.disableEditMode()
// })

// const printObject = document.getElementById('print-obj').addEventListener('click', () => {
//     network.addEdgeMode()
// })

// const addNode = document.getElementById('add-to-obj').addEventListener('click', ()=> {
//     nodes.remove(nodes.get())
//     edges.remove(edges.get())
// })
const testButton = document.getElementById('test-button').addEventListener('click', () => {
    console.log(network.getSerializeCanvasToSvg())
    
})



