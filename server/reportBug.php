<?php

require_once ( './core/bugReportCore.php' );
require_once ( './core/utilities.php' );


try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");
    try {
        $description = getParameter($mysql, "description");
    } catch (Exception $e) {
        $description = null;
    }

    try {
        $reproduction = getParameter($mysql, "reproduction");
    } catch (Exception $e) {
        $reproduction = null;
    }

    try {
        $stacktrace = getParameter($mysql, "stacktrace");
    } catch (Exception $e) {
        $stacktrace = null;
    }

    try {
        $state = getParameter($mysql, "state");
    } catch (Exception $e) {
        $state = null;
    }

    if (authenticateUser($mysql, $username, $password)) {
        submitReport($mysql, $username, $description, $reproduction, $stacktrace, $state);

        //Now send an email
        $from = getOneValueFromUserList($mysql, "email", $username);
        $subject = "Report email";
        $message = "Description:" . "\r" . $description . "\r." . "Reproduction:" . "\r" . $reproduction;
        $to = "bug_reports_rightboard@armyr.se";
        $headers = "From:" . $from;
        mail($to, $subject, $message, $headers);
        echo "OK. Report submitted successfully";
    } else {
        echo "FAIL: Authentication failed";
    }
} catch (Exception $e) {
    echo "FAIL: " . $e->getMessage();
}
?>
