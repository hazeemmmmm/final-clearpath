<?php
include("connection.php");

if (isset($_POST['submit'])) {
    $newpass = $_POST["password"];
    $confirm_pass = $_POST["confirm_pass"];

    $lowercase = preg_match('@[a-z]@', $newpass);
    $uppercase = preg_match('@[A-Z]@', $newpass);
    $number = preg_match('@[0-9]@', $newpass);
    $specialcharacter = preg_match('@[^\w]@', $newpass);

    if (empty($newpass)) {
        echo "PASSWORD is required<br><br>";
    } elseif (empty($confirm_pass)) {
        echo "CONFIRM_PASSWORD is required<br><br>";
    } elseif (($lowercase < 1 || $uppercase < 1 || $number < 1 || $specialcharacter < 1)) {
        echo "PASSWORD is weak, must contain lowercase letters, uppercase letters, digits, and special characters !<br><br>";
    } elseif ($newpass !== $confirm_pass) {
        echo "Passwords do not match.<br><br>";
    } else {
        $hashedPassword = password_hash($newpass, PASSWORD_DEFAULT);
        $email = $_SESSION['email'];
        $update = "UPDATE `user` SET `user_password` = '$hashedPassword' WHERE `user_email` = '$email'";
        $run_update = mysqli_query($connect, $update);
        if ($run_update) {
            echo "Password reset successful.";
            header("Location: home.html");
            // exit();
        } else {
            echo "Password reset failed.";
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
         <!-- ========== Start Google fonts ========== -->
         <link rel="preconnect" href="https://fonts.googleapis.com" />
         <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
         <link
           href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;600;700&family=Oswald:wght@200;300;400;500;600;700&display=swap"
           rel="stylesheet"
         />
         <!-- ========== End Google fonts ========== -->
     
         <!-- ========== Start font awesome library ========== -->
         <link rel="stylesheet" href="./css/all.min.css" />
     
         <!-- ========== End font awesome library ========== -->
     
         <!-- ========== Start bootstrap css link ========== -->
         <link rel="stylesheet" href="./css/bootstrap.min.css" />
         <!-- ========== End bootstrap css link ========== -->
     
         <!-- ========== Start Section ========== -->
         <link rel="stylesheet" href="./css/GLOBAL.css" />
         <link rel="stylesheet" href="./css/resetpass.css   ">
         <!-- ========== End Section ========== -->

    
</head>
<body>

  <div class="logo">
    <i class="fa-solid fa-franc-sign"></i>
  </div>


          <!-- start form -->

          <div class="loginn d-flex justify-content-center align-items-center">
            <div class="formholder">
            
                
                <form class="form" method="POST">
                    <p class="form-title">Reset Your Password</p>
                    <p class="instructions">Set your new password</p>
                    <div class="input-container">
                       <input type="password" name="password"  placeholder="New Password">
                    
                    </div>
                    <div class="input-container">
                       <input type="password" name="confirm_pass" placeholder="Confirm Password">
                    
                    </div>
                    <button type="submit" name="submit" class="submit">
                        Reset Password
                    </button>
                    
                </form>
            </div>
            </div>
            <!-- end form -->
            
            



     <!-- footer start -->
     <footer>
        <p class="text-center pt-5">
          <span> <i class="bi bi-c-circle"></i> </span> Copyright
          <strong>Service Hub</strong>
          All Rights Reserved <br />
          Designed by <a href="#">WebDesign-Team</a>
        </p>
      </footer>
      <!-- footer end -->




    <script src="./js/bootstrap.bundle.min.js"></script>
</body>
</html>