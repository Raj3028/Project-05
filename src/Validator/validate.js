//<<<==================================== Function for validation =======================================>>>//

//===================== Checking that there is something as Input =====================//
const checkInputsPresent = (value) => { return (Object.keys(value).length > 0); }

//===================== Validating that the Input must be a non-empty String =====================//
const checkString = function (value) {
    if (typeof value == "number" || typeof value == "undefined" || value == null) { return false }
    if (typeof value == "string" && value.trim().length == 0) { return false }
    return true
}