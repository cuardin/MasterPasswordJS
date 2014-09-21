<?php

require_once(dirname(__FILE__).'/utilities.php');

function autoExtendLicense($mysql, $email, $type) {

    $extensionDays = 0;

    //First check that the type is supported.
    if (!strcmp($type, 'REVIEW')) {
        $extensionDays = 60;
    }
    if (!strcmp($type, 'NEW')) {
        $extensionDays = 300;
    }
    if (!strcmp($type, 'BUG')) {
        $extensionDays = 60;
    }
    //Then check if we have such a user in our database
    $username =
            getUserNameFromEmail($mysql, $email);
    //echo 'User name: ' . $username . '<br/>';
    if (!strcmp($username, "")) {
        echo "FAIL: Email not found in database";
        return false;
    }

    // Then find when the current license expires    
    $oldExpirationDateString =
            getOneValueFromUserList($mysql, "expirationDate", $username);
    $oldExpirationDate = strtotime($oldExpirationDateString);
    $newExpirationDate = strtotime(getDateString()) + $extensionDays * 24 * 60 * 60;
    $newExpirationDateString = date('Y-m-d h:i:s', $newExpirationDate);

    $extensionGranted = $oldExpirationDate < $newExpirationDate;

    //Make a log entry
    logExtension($mysql, $username, $oldExpirationDateString, $newExpirationDateString, $type, $extensionGranted);

    //Check if we will make an actual change or not.
    if (!$extensionGranted) {
        echo 'FAIL: Current license expiration is too far into the future.';
        return false;
    }

    $query = "UPDATE whiteboard_users SET expirationDate=? WHERE username=?";

    $stmt = $mysql->prepare($query);
    $bOK = true;
    if ($stmt) {
        $bOK = false;
    }

    if (!(bOK && $stmt->bind_param('ss', $newExpirationDateString, $username) )) {
        $bOK = false;
    }

    if (!(bOK && $stmt->execute() )) {
        $bOK = false;
    }
    if (!(bOK && $stmt->close() )) {
        $bOK = false;
    }
    if (bOK) {
        return true;
    } else {
        echo 'FAIL: Statement creation failed.';
        return false;
    }

    return true;
}

function logExtension($mysql, $username, $oldExpiringDateString, $newExpiringDateString, $type, $extenstionGranted) {
    $query = "INSERT INTO whiteboard_license_extensions(" .
            "username, oldExpirationDate, " .
            "newExpirationDate, extensionType, extensionGranted) " .
            "VALUES (?, ?, ?, ?, ?)";

    $stmt = $mysql->prepare($query);
    if ($stmt) {
        $stmt->bind_param('ssssi', $username, $oldExpiringDateString, $newExpiringDateString, $type, $extenstionGranted);

        $stmt->execute();
        $stmt->close();
    } else {
        echo 'FAIL: Statement creation failed<br/>';
        echo htmlspecialchars($mysql->error);
        return false;
    }
    return true;
}

?>
