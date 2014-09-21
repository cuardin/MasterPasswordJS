<?php

require_once ('./core/utilities.php');



try {
    $mysql = connectDatabase();

    $username = getParameter($mysql, "username");
    $password = getParameter($mysql, "password");

    //Check that credentials are good.
    if (authenticateUser($mysql, $username, $password)) {
        //And list the files
        $stmt = $mysql->prepare("SELECT * FROM whiteboard_files WHERE username=?");
        if ( !$stmt ) {
            throw new Exception ();
        }
        
        if ( !$stmt->bind_param('s', $username) ) {
            throw new Exception();
        }
        if ( !$stmt->execute() ) {
            throw new Exception();
        }
        $res = $stmt->get_result();
        if (!$res) {
            throw new Exception();
        }

        $xml = new SimpleXMLElement('<xml/>');

        for ($row_no = $res->num_rows - 1; $row_no >= 0; $row_no--) {
            $res->data_seek($row_no);
            $row = $res->fetch_assoc();

            $fileKey = htmlspecialchars($row['fileKey'] );
            $creationDate = htmlspecialchars($row['creationDate'] );
            $fileName = htmlspecialchars($row['fileName'] );

            $fileEntry = $xml->addChild('file');
            $fileEntry->addChild('fileID', $fileKey);
            $fileEntry->addChild('creationDate', $creationDate );
            $fileEntry->addChild('fileName', $fileName );
        }

        Header('Content-type: text/xml');
        print($xml->asXML());
    }
} catch ( Exception $e )  {
    echo "FAIL: " . $e->getMessage();
}
?>
