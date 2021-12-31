function navigate() {
    let select = document.querySelector("select");
    console.log(select.value);
    if(select.value == "India") {
        
    }
    else if (select.value == "Bangladesh") {
        window.location.href = "/bangladesh";
        console.clear();
    }
}