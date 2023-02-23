console.log("hello babe");
var submitBtn = document.getElementsByName("signup")[0];
var fields = {
    firstname: null,
    lastname: null,
    username: null,
    email: null,
    password: null,
    cpassword: null,
    consent: null,
    upline: null
}

function getVal(field) {
    return document.getElementsByName(field)[0].value;
}

function getFieldsObj(fields) {
    for (let field in fields) {
        fields[field] = getVal(field)
    }
    return fields
}

function toggleSubmitRegBtn() {
    let isBtnEnabled = submitBtn.attributes.disabled;
    let updatedFieldsObj = getFieldsObj(fields);
    let allFieldsFilled = !Object.values(updatedFieldsObj).includes("");

    console.log("updatedFieldsObj.password", updatedFieldsObj);
    let arePasswordsEqual = updatedFieldsObj.password === updatedFieldsObj.cpassword

    if (allFieldsFilled && arePasswordsEqual) {
        submitBtn.removeAttribute("disabled");
    } else {

        let unfilledFields = []
        for (let field in updatedFieldsObj) {

            if (!updatedFieldsObj[field]) {
                unfilledFields.push(field)
                //   document.getElementsByName(`${field}-e`)[0].textContent = field + " is required.";
            } else {
                unfilledFields.pop(field)
                document.getElementsByName(`${field}-e`)[0].textContent = ""
            }

        }
        //console.log(unfilledFields);

        if (unfilledFields.length) {
            document.getElementsByName(`${unfilledFields[0]}-e`)[0].textContent = unfilledFields[0] + " is required.";

        }
        //console.log({arePasswordsEqual});
        submitBtn.setAttribute("disabled", true);
    }

    if (!arePasswordsEqual) {
        document.getElementsByName("cpassword-e")[0].textContent = "Passwords do not match!";
    } else {
        document.getElementsByName("cpassword-e")[0].textContent = ""
    }
    submitBtn.textContent = "Sign up"
}

for (let field in fields) {
    //console.log("hello");
    document.getElementsByName(field)[0].addEventListener("keyup", toggleSubmitRegBtn);
}

const handleSubmitClick = async () => {
    console.log("in here");
    submitBtn.setAttribute("disabled", true);
    submitBtn.textContent = "Please wait...";
    console.log({fields});
    await fetch("/submit-registration", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
    
      }).then(res => {
        console.log({ res });
        window.location.href = "/login";
        return res.json();
      })
        .catch(err => {
          signInBtn.removeAttribute("disabled");
          console.log(err)
        })
}



submitBtn.addEventListener("click", handleSubmitClick)
