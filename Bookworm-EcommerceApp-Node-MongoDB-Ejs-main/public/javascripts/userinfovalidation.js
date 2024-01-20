const form1 = document.querySelector("#userInfo");
const userName1 = form1.querySelector("#userName");
const email1 = form1.querySelector("#email");
const phoneNumber1 = form1.querySelector("#phoneNumber");
const age1 = form1.querySelector("#age");
const errorElement1 = form1.querySelector('#error');



function hideErrorMessage(){
    errorElement1.innerHTML="";
}
function showErrorMessage(message){
    errorElement1.innerHTML =`<div class="alert alert-warning border border-warning w-80 d-flex justify-content-center fw-bold py-2" role="alert" >${message}</div>`;
    setTimeout(()=>{
        errorElement1.innerHTML =`<div></div>`
    },5000);
}
function submitformUserInfo(e){
    // e.preventDefault()
    if(userName1.value === ""){
        showErrorMessage("Name field is empty");
        return false;
    }

    if(userName1.value.trim()==""){
        showErrorMessage("Name field is empty");
        return false;
    }

    if(userName1.value.length >30){
        showErrorMessage("Name must be less than 30");
        return false;
    }


    if(email1.value === ""){
        showErrorMessage("Email1 field is empty");
        return false;
    }

    if(email1.value.trim()==""){
        showErrorMessage("Email field is empty");
        return false;
    }

    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (email1.value.match(validRegex)) {
      
      } else {
        showErrorMessage("Email is not correct");
        return false;
      }
    
    if(phoneNumber1.value === ""){
        showErrorMessage("Phonenumber field is empty");
        return false;
    }

    if(phoneNumber1.value.trim()==""){
        showErrorMessage("Phone Number field is empty");
        return false;
    }

    if(phoneNumber1.value.length <10){
        showErrorMessage("Phone Number must be 10 numbers");
        return false;
    }

    if(phoneNumber1.value.length >13){
        showErrorMessage("Incorrect Phone Number");
        return false;
    }

    if(phoneNumber1.value <= 5999999999){
        showErrorMessage("Incorrect Phone Number");
        return false;
    }

    if(age1.value === ""){
        showErrorMessage("Age field is empty");
        return false;
    }

    if(age1.value.trim()==""){
        showErrorMessage("Age field is empty");
        return false;
    }

    if(age1.value.length >3){
        showErrorMessage("Enter the correct Age");
        return false;
    }

    if(age1.value<= 0){
        showErrorMessage("Enter the correct Age");
        return false;
    }

    if(age1.value>= 200){
        showErrorMessage("Enter the correct Age");
        return false;
    }
    hideErrorMessage()
    return true;
}
    
