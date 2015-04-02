# WebGIVI
# Implemention
1. Permission of folder usrID  
Give full permission to folder usrID.   
Command line in terminal:  
-----------------------  
 chmod 777 usrID  
----------------------  
2. Empty folder 'usrID'   
Empty folder 'usrID' everyday  
Command line:  
------------------------   
crontab -e  
0 0 * * * /usr/bin/php  /PATHTOYOURDIRECTORY/delete_cron_webgivi.php  
-----------------------  
this command line will empty folder 'usrID' everyday at 12am.
