exports.dateTimeOut = function() {
    let d = new Date();
    let day = d.toLocaleDateString();
    let time = d.toLocaleTimeString();
    return day + " " + time + ": ";
    //return "My response";
}