<?php
/**
 * Zend Framework (http://framework.zend.com/)
 *
 * @link      http://github.com/zendframework/ZendSkeletonApplication for the canonical source repository
 * @copyright Copyright (c) 2005-2015 Zend Technologies USA Inc. (http://www.zend.com)
 * @license   http://framework.zend.com/license/new-bsd New BSD License
 */

namespace Application\Controller;

use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;
use SystemCtrl\ctrlSystem;

class MenterController extends AbstractActionController
{
    // 新版登入
    public function setlogininfoAction(){
        $SysClass = new ctrlSystem;
        // 預設不連資料庫
        $SysClass->initialization();
        // 連線指定資料庫
        // $SysClass->initialization("設定檔[名稱]",true); -> 即可連資料庫
        // 連線預設資料庫
        // $SysClass->initialization(null,true);
        try{
            //-----BI開始-----
            $action = array();
            $action["status"] = false;
            if(!empty($_POST)){
                if($_POST["uuid"]){
                    $userPosition = $this->verifyUser($SysClass);
                    
                    if($userPosition["status"]){
                        // 設置相關的帳號
                        $_SESSION["uuid"] = $userPosition["uuid"];
                        $_SESSION["userAc"] = $userPosition["userAc"];
                        // 選單權限
                        // $_SESSION["menuPosition"] = $userPosition["menuPosition"];
                        $_SESSION["isAdmin"] = $userPosition["isAdmin"];

                        $action["msg"] = "驗證成功";
                        $action["userPosition"] = $userPosition;
                        $action["status"] = true;
                    }else{
                        // 驗證失敗，請重新登入
                        $action["msg"] = 'uuid is error, This Login is False';
                    }
                }else{
                    $action["msg"] = 'This Login is False';
                    $action["code"] = 2;
                }
            }else{
                $action["msg"] = 'This Status is False';
                $action["code"] = 1;
            }
            $pageContent = json_encode($action);
            //----BI結束----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            // $SysClass->WriteLog("MenterController", "setloginAction", $error->getMessage());
        }
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
    }

    public function logoutAction()
    {
		@session_start();
		@session_destroy();
		return new ViewModel();
		
    }

    private function userName($userID){
        $SysClass = new ctrlSystem;
        // 預設不連資料庫
        // $SysClass->initialization();
        // 連線指定資料庫
        // $SysClass->initialization("設定檔[名稱]",true); -> 即可連資料庫
        // 連線預設資料庫
        $SysClass->initialization(null,true);
        try{
            //-----BI開始-----
            $userName = "";
            $strSQL = "select t2.name from ass_user t1 ";
            $strSQL .= "left join ass_common t2 on t1.cmid = t2.uid ";
            $strSQL .= "where t1.uid = '".$userID."' ";

            $data = $SysClass->QueryData($strSQL);

            if(!empty($data)){
                $userName = $data[0]["name"];
            }
            
            return $userName;
            //----BI結束----
        }catch(Exception $error){
            //依據Controller, Action補上對應位置, $error->getMessage()為固定部份
            // $SysClass->WriteLog("MenterController", "setloginAction", $error->getMessage());
        }
    }

    private function verifyUser($SysClass){
        $APIUrl = $SysClass->GetAPIUrl('rsApiURL');
        $APIUrl .= "customersManaAPI/verify";
        // 進行UUID驗證
        $sendData = array();
        $sendData["uuid"] = $_POST["uuid"];                    
        // 送出
        $userPosition = $SysClass->UrlDataPost($APIUrl,$sendData);
        // print_r($userPosition);
        // exit();
        $userPosition = $SysClass->Json2Data($userPosition["result"],false);
        // print_r($userPosition);
        // exit();
        return $userPosition;
    }
}
