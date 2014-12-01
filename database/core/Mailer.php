<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
require_once ( dirname(__FILE__).'/IMailer.php' );
/**
 * Description of Mailer
 *
 * @author cuardin
 */
class Mailer implements IMailer {
    function sendEmail( $to, $subject, $message, $headers )
    {                        
        mail($to, $subject, $message, $headers);        
    }
}
