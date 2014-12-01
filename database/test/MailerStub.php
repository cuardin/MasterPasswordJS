<?php

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of MailerStub
 *
 * @author cuardin
 */
class MailerStub implements IMailer {        
    public function sendEmail($to, $subject, $message, $from) {
        echo "$to\n$subject\n$message\n$from";        
    }
    

}
