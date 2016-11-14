var userLoginInfo;
function checkUserLogin(){
	$.getJSON(configObject.getAcInfo,{},function(rs){
		if(!rs.status){
			msgDialog(rs.msg||"帳號設置有誤，請聯絡管理員", true, function(){
				logoutEven();
			});
		}else{

            if(location.search.search("select-sys") != -1 || location.search.search("user-mana%2Fadmin") != -1){
            	$(".topInfo").hide();
            }

            userLoginInfo = rs;

   			userLoginInfo.userID = rs.uuid;
			userLoginInfo.userName = rs.userAc;

			if(rs.userID){
				userNameBarInfo();
				firstLoadPage();
				// 首頁內容 - 暫時載入客戶列表
				// loadPage("customers/list","pagescontent");
			}else{
				msgDialog("帳號設置有誤，請聯絡管理員");
				logoutEven();
			}
		}
	});
}

function userNameBarInfo(){
	//重新整理的小圈
	var nameBar = $('<span>').addClass("userNameInfo").text(userLoginInfo.userName);
	$(".user-name").empty().append(nameBar);
}