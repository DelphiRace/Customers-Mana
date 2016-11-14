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

class PageactionController extends AbstractActionController
{
	//不執行任何動作
	public function indexAction()
    {
		$this->viewContnet['pageContent'] = 'Please Select Your Action and Try Again!';
        return new ViewModel($this->viewContnet);
    }
    
    //取得帳號資訊(須登入後才可以使用)
    public function acinfoAction(){
        try{
        //-----BI開始-----
        	$SysClass = new ctrlSystem;
	        // 預設不連資料庫
	        $SysClass->initialization();
	        // 連線指定資料庫
	        // $SysClass->initialization("設定檔[名稱]",true); -> 即可連資料庫
	        // 連線預設資料庫
	        // $SysClass->initialization(null,true);

	        $action = array();
	        $action["status"] = false;
	        $userPosition = $this->verifyUser($SysClass);
	        // $start_time = microtime(true);
	        if($userPosition["status"] and !empty($_SESSION["uuid"])){
	            $action["uuid"] = $_SESSION["uuid"];
	            $action["isAdmin"] = $_SESSION["isAdmin"];
	            $action["userAc"] = $_SESSION["userAc"];
	            // print_r($_SESSION);
	           
	            // $action["menuPosition"] = $_SESSION["menuPosition"];
	            $action["status"] = true;
	        }else{
	            $action["msg"] = 'Please Login Again!';
	        }
	       	// $end_time = microtime(true);
	       	// $action["times"] = $end_time - $start_time;
	        $pageContent = json_encode($action);
        //-----BI結束-----
	    }catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "acinfoAction", $error->getMessage());
		}
        $this->viewContnet['pageContent'] = $pageContent;
        return new ViewModel($this->viewContnet);
        
    }

    // 驗證使用者
    private function verifyUser($SysClass){
        $APIUrl = $SysClass->GetAPIUrl('rsApiURL');
        $APIUrl .= "customersManaAPI/verify";
        // 進行UUID驗證
        $sendData = array();
        $sendData["uuid"] = $_SESSION["uuid"];                    
        // 送出
        $userPosition = $SysClass->UrlDataPost($APIUrl,$sendData);
        // print_r($userPosition);
        // exit();
        $userPosition = $SysClass->Json2Data($userPosition["result"],false);
        // print_r($userPosition);
        // exit();
        return $userPosition;
    }
	
	//產生選單
	private function CreatMenuContent($MenuData, $creatParentStyle, $contentStyle, $otherContentStyle){
		try{
			$tmpMenuStr = '';
			$tmpMenuArr = array();
			//先整理
			foreach($MenuData as $content){
				$tmpMenuArr[$content["parent_layer"]][$content["uid"]] = $content;
			}
			
			//放好第一層級的資料
			foreach($tmpMenuArr[0] as $content){
				
				//這代表還有第二層
				if(!empty($tmpMenuArr[$content["uid"]])){
					$tmpStyle = $creatParentStyle;
					$otherMenuContent = $this->CreatOtherMenuContent($content["uid"], $tmpMenuArr, $creatParentStyle, $otherContentStyle);
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent);
				}else{
					$tmpStyle = $contentStyle;
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content);
				}
				
			}
			
			return $tmpMenuStr;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatMenuContent", $error->getMessage());
		}
	}
	
	//產生其他子層的選單選單
	private function CreatOtherMenuContent($otherLayerDataIndex, $totalMenuData, $creatParentStyle, $otherContentStyle){
		try{
			$tmpMenuStr = '';
			foreach($totalMenuData[$otherLayerDataIndex] as $content){
				
				//這代表還有第二層
				if(!empty($totalMenuData[$content["uid"]])){
					$tmpStyle = $creatParentStyle;
					//重複建好
					$otherMenuContent = $this->CreatOtherMenuContent($content["uid"], $totalMenuData, $creatParentStyle, $otherContentStyle);
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent);
				}else{
					$tmpStyle = $otherContentStyle;
					$tmpMenuStr .= $this->replaceMenuOptiuonChar($tmpStyle, $content);
				}
				
			}
			
			return $tmpMenuStr;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatOtherMenuContent", $error->getMessage());
		}
	}
	//取代選單的字
	private function replaceMenuOptiuonChar($tmpStyle, $content, $otherMenuContent=''){
		try{
			$tmpStyle = str_replace("@@nid@@",$content["nid"],$tmpStyle);
			$tmpStyle = str_replace("@@href@@",$content["href"],$tmpStyle);
			
			if($content["click_action"] != ''){
				$tmpStyle = str_replace("@@onclick@@",'onclick = "'.$content["click_action"].'"',$tmpStyle);
			}else{
				$tmpStyle = str_replace("@@onclick@@",'',$tmpStyle);
			}
			
			if($otherMenuContent){
				$tmpStyle = str_replace("@@sonContent@@",$otherMenuContent,$tmpStyle);
			}
			
			if($content["class_style"]){
				$tmpStyle = str_replace("@@class@@",$content["class_style"],$tmpStyle);
			}else{
				$tmpStyle = str_replace("@@class@@","",$tmpStyle);
			}
			
			return $tmpStyle;
		}catch(Exception $error){
			//依據Controller, Action補上對應位置, $error->getMessage()為固定部份
			$VTs->WriteLog("PageactionController", "CreatOtherMenuContent", $error->getMessage());
		}
	}
	
}
