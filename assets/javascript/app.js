$(document).ready(function () {
    // initializing firebase API
    var config = {
        apiKey: "AIzaSyDw2XmL3BiHuPqwVE3zL1MpDthDU1sMAlA",
        authDomain: "train-schedule-homework-7ef2a.firebaseapp.com",
        databaseURL: "https://train-schedule-homework-7ef2a.firebaseio.com",
        projectId: "train-schedule-homework-7ef2a",
        storageBucket: "train-schedule-homework-7ef2a.appspot.com",
        messagingSenderId: "276069425127"
    };
    firebase.initializeApp(config);
    var database = firebase.database();
    // function for when submit is clicked
    $("#submit").on("click", function (event) {
        event.preventDefault();
        var newTrain = $("#train-name").val().trim();
        var destination = $("#destination").val().trim();
        // this value is taken in as HH:mm
        var firstTime = $("#first-time").val().trim();
        var frequency = $("#frequency").val().trim();
        // this grabs today's month and date
        var date = moment().get("year") + "-" + (parseInt(moment().get("month")) + 1) + "-" + moment().get("date");
        // this parses the original start time
        var fullTime = date + " " + firstTime;
        // pushes essential data into firebase
        database.ref().push({
            trainName: newTrain,
            destination: destination,
            frequency: frequency,
            fullTime: fullTime
        })
        // clearing all the input fields
        $("#train-name").val("");
        $("#destination").val("");
        $("#first-time").val("");
        $("#frequency").val("");
    })
    var nextArrival;
    var nextArrivalDisplay;
    var minutesAway;
    // firebase listener
    database.ref().on("child_added", function (snapshot) {
        // grabbing data off firebase and determining how many minutes away the next train is
        nextArrival = snapshot.val().fullTime;
        nextArrivalDisplay = moment(nextArrival).format("MM-DD-YY HH:mm");
        minutesAway = moment(nextArrival).diff(moment(), "minutes");
        // statement to update the next train arrival if the old train already departed
        while (minutesAway < 0) {
            nextArrival = moment(moment(nextArrival).add(snapshot.val().frequency, "minutes")).format("MM-DD-YY HH:mm");
            nextArrivalDisplay = moment(nextArrival).format("MM-DD-YY HH:mm");
            minutesAway = moment(nextArrival).diff(moment(), "minutes");
        }
        // put all the current information up into the table, storing the key as data-value
        $("#schedule").append("<tr data-value=" + snapshot.key + "><td>" + snapshot.val().trainName + "</td>" +
            "<td>" + snapshot.val().destination + "</td>" +
            "<td>" + snapshot.val().frequency + "</td>" +
            "<td>" + nextArrivalDisplay + "</td>" +
            "<td>" + minutesAway + "</td>");
        // update firebase with the most current train data
        database.ref(snapshot.key).update({ fullTime: nextArrival });
    }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
    // function to remove trains from schedule
    $("#schedule").on("click", "tr", function () {
        // retrieves the key for the child 
        var key = $(this).attr("data-value");
        // using the key, deleting the child from the database
        database.ref().child(key).remove();
        // removing the line from the table
        $(this).remove();
    });
});