
var datass = '';
var DataArr = [];
PDFJS.workerSrc = '';

function ExtractText() {
    var input = document.getElementById("file-id");
    var fReader = new FileReader();
    fReader.readAsDataURL(input.files[0]);
    // console.log(input.files[0]);
    fReader.onloadend = function (event) {
        convertDataURIToBinary(event.target.result);
    }
}

var BASE64_MARKER = ';base64,';

function convertDataURIToBinary(dataURI) {

    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for (var i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }
    pdfAsArray(array)

}

function getPageText(pageNum, PDFDocumentInstance) {
    // Return a Promise that is solved once the text of the page is retrieven
    return new Promise(function (resolve, reject) {
        PDFDocumentInstance.getPage(pageNum).then(function (pdfPage) {
            // The main trick to obtain the text of the PDF page, use the getTextContent method
            pdfPage.getTextContent().then(function (textContent) {
                var textItems = textContent.items;
                var finalString = "";

                // Concatenate the string of the item to the final string
                for (var i = 0; i < textItems.length; i++) {
                    var item = textItems[i];

                    finalString += item.str + " ";
                }

                // Solve promise with the text retrieven from the page
                resolve(finalString);
            });
        });
    });
}

function pdfAsArray(pdfAsArray) {

    PDFJS.getDocument(pdfAsArray).then(function (pdf) {

        var pdfDocument = pdf;
        // Create an array that will contain our promises
        var pagesPromises = [];

        for (var i = 0; i < pdf.pdfInfo.numPages; i++) {
            // Required to prevent that i is always the total of pages
            (function (pageNumber) {
                // Store the promise of getPageText that returns the text of a page
                pagesPromises.push(getPageText(pageNumber, pdfDocument));
            })(i + 1);
        }

        // Execute all the promises
        Promise.all(pagesPromises).then(function (pagesText) {

            // Display text of all the pages in the console
            // e.g ["Text content page 1", "Text content page 2", "Text content page 3" ... ]
            // console.log(pagesText); // representing every single page of PDF Document by array indexing
            // console.log(pagesText.length);
            var outputStr = "";
            for (var pageNum = 0; pageNum < pagesText.length; pageNum++) {
                // console.log(pagesText[pageNum]);
                outputStr = "";
                outputStr = "<br/><br/>Page " + (pageNum + 1) + " contents <br/> <br/>";

                var outputDiv = document.querySelector("div#output");

                outputDiv.innerHTML += (outputStr + pagesText[pageNum]);

            }

        });

    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
}


var extractedData;
var extractedDataArray;
function getExtractedData() {
    extractedData = document.querySelector("div").innerText;
    extractedData = filterText();
    let dataObject = {
        CertificateNo: getCertificateNo(),
        NIDNumber: getNIDNumber(),
        PassportNumber: getPassportNumber(),
        Country: getCountry(),
        Name: getName(),
        DOB: getDOB(),
        Gender: getGender(),
        DateOfFirstDose: getDateOfFirstDose(),
        NameOfVaccineDose1: getNameOfVaccineDose1(),
        DateOfSecondDose: getDateOfSecondDose(),
        NameOfVaccineDose2: getNameOfVaccineDose2(),
        VaccinationCenter: getVaccinationCenter(),
        DoseBy: getDoseBy()
    };
    console.log(dataObject);
    // document.querySelector("#object").innerHTML = JSON.stringify(dataObject);

    insertFormValues(dataObject);
}

function filterText() {
    let filteredText = "";
    for (let i = 0; i < extractedData.length; i++) {
        if(extractedData.charCodeAt(i)< 200) {
            filteredText = filteredText + extractedData[i];
        }
    }

    var div = document.getElementById('output');
    let trimIndex = filteredText.indexOf("Certificate No:");
    filteredText = filteredText.substring(trimIndex);
    trimIndex = filteredText.indexOf("To verify this certificate");
    filteredText = filteredText.substring(0, trimIndex)
    filteredText = filteredText.split('( ):').join('');
    filteredText = filteredText.split(' -').join('');
    filteredText = filteredText.split('/ ').join('');
    filteredText = filteredText.split(': ').join('');
    filteredText = filteredText.split('Certificate No').join('');
    filteredText = filteredText.split('Date of Vaccination (Dose 1)').join(':');
    filteredText = filteredText.split('NID Number').join(':');
    filteredText = filteredText.split('Name of Vaccine (Dose 1)').join(':');
    filteredText = filteredText.split('Passport No').join(':');
    if(filteredText.indexOf("Country/Nationality") > 0) {
        filteredText = filteredText.split('Country/Nationality').join(':');
    }
    else if(filteredText.indexOf("Country") > 0) {
        filteredText = filteredText.split('Country').join(':');
    }
    else if(filteredText.indexOf("Nationality") > 0) {
        filteredText = filteredText.split('Nationality').join(':');
    }
    filteredText = filteredText.split('Date of Vaccination (Dose 2)').join(':');
    filteredText = filteredText.split('Name of Vaccine (Dose 2)').join(':');
    filteredText = filteredText.split('Vaccination Center').join(':');
    filteredText = filteredText.split('Date of Birth').join(':');
    filteredText = filteredText.split('Gender').join(':');
    filteredText = filteredText.split('Vaccinated By').join(':');
    filteredText = filteredText.split('Name').join(':');
    div.innerHTML = filteredText;
    extractedDataArray = filteredText.split(":");
    for (let i = 0; i < extractedDataArray.length; i++) {
        extractedDataArray[i] = extractedDataArray[i].trim();
    }
    return filteredText;
}

function insertFormValues(dataObject) {
    let form = document.querySelector('form');
    let formContainer = document.querySelector(".formContainer");
    form.querySelector("#Name").value = dataObject.Name;
    form.querySelector("#CertificateNo").value = dataObject.CertificateNo;
    form.querySelector("#NIDNumber").value = dataObject.NIDNumber;
    form.querySelector("#PassportNumber").value = dataObject.PassportNumber;
    form.querySelector("#DOB").value = dataObject.DOB;
    form.querySelector("#Country").value = dataObject.Country;
    form.querySelector("#Gender").value = dataObject.Gender;
    form.querySelector("#DateOfFirstDose").value = dataObject.DateOfFirstDose;
    form.querySelector("#NameOfVaccineDose1").value = dataObject.NameOfVaccineDose1;
    form.querySelector("#DateOfSecondDose").value = dataObject.DateOfSecondDose;
    form.querySelector("#NameOfVaccineDose2").value = dataObject.NameOfVaccineDose2;
    form.querySelector("#VaccinationCenter").value = dataObject.VaccinationCenter;
    form.querySelector("#DoseBy").value = dataObject.DoseBy;
    formContainer.classList.add("display");
}


function getCertificateNo() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[0]
    }
}
function getNIDNumber() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[2]
    }
}
function getPassportNumber() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[4]
    }
}
function getCountry() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[6]
    }
}
function getName() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[8]
    }
}
function getDOB() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[10]
    }
}
function getGender() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[11]
    }
}

function getDateOfFirstDose() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[1]
    }
}
function getNameOfVaccineDose1() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[3]
    }
}
function getDateOfSecondDose() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[5]
    }
}
function getNameOfVaccineDose2() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[7]
    }
}
function getVaccinationCenter() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[9]
    }
}
function getDoseBy() {
    if(extractedDataArray.length == 13) {
        return extractedDataArray[12]
    }
}


function pageRefresh() {
    location.reload();
}