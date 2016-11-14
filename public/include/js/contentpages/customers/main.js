$(function(){
    getData();
});

// 取得資料
function getData(uid){
    loader($("#grid"));
    if(uid != undefined){
        data = { iUid : uid };
    }else{
        data = {};
    }
    var sendData = {
        api: customersAPI+"cuslist",
        threeModal: true,
        data: data
    }
    
    // ＡＰＩ呼叫
    $.getJSON(wrsUrl, sendData ).done(function(rs){
        $("#grid").empty();
        if(rs.status){
            if(uid == null){
                putDataToPage(rs.data);
            }else{
                // insertDialog(uid,name);
            }
        }else{
            // 放入空的
            putEmptyInfo($("#grid"));
        }
        // console.log(rs);
    }).fail(function(){
        // 放入空的
        putEmptyInfo($("#grid"));
    });
}

// 放資料
function putDataToPage(data, onlyData){
    if(typeof onlyData == "undefined"){
        onlyData = false;
    }
    // console.log(data);
    // 畫面設定值
    var option = {styleKind:"customers",style:"list"};
    // 取得畫面樣式
    getStyle(option,function(pageStyle){
        if(!onlyData){
            $.each(data,function(index,content){
                var pageStyleObj = $.parseHTML(pageStyle);
                $(pageStyleObj).addClass("dataContent");
                // 名稱
                $(pageStyleObj).find(".list-items").eq(0).html(content.name);
                // 附屬說明
                $(pageStyleObj).find(".list-items").eq(1).html(content.address);
                $(pageStyleObj).find(".list-items").eq(2).html(content.admin);
                if(content.limitTime != undefined){
                    $(pageStyleObj).find(".list-items").eq(3).html(content.limitTime);
                }else{

                    $(pageStyleObj).find(".list-items").eq(3).html("-");
                }
                // console.log(content);
                // 修改
                $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                    insertDialog(content.uid, content, $(this));
                });

                $(pageStyleObj).find(".fa-clock-o").click(function(){
                    modifyEndDate(content, $(pageStyleObj));
                });

                // 刪除
                $(pageStyleObj).find(".fa-trash-o").click(function(){
                    deleteData(content.uid, $(this).parents(".list-items").parent(), content.name);
                });

                $(pageStyleObj).appendTo($("#grid"));

            });
        }else{
            console.log(data);
            if($("#grid").find(".data-empty").length){
                $("#grid").find(".data-empty").remove();
            }
            // console.log(data);
            var pageStyleObj = $.parseHTML(pageStyle);
            $(pageStyleObj).addClass("dataContent");
            
            $(pageStyleObj).find(".list-items").eq(0).html(data.name);
            $(pageStyleObj).find(".list-items").eq(1).html(data.address);
            $(pageStyleObj).find(".list-items").eq(2).html(data.admin);
            if(data.limitTime != undefined){
                $(pageStyleObj).find(".list-items").eq(3).html(data.limitTime);
            }else{

                $(pageStyleObj).find(".list-items").eq(3).html("-");
            }

            // 修改
            $(pageStyleObj).find(".fa-pencil-square-o").click(function(){
                insertDialog(data.uid, data, $(this));
            });

            $(pageStyleObj).find(".fa-clock-o").click(function(){
                modifyEndDate(data, $(this));
            });

            // 刪除
            $(pageStyleObj).find(".fa-trash-o").click(function(){
                deleteData(data.uid, $(this).parents(".list-items").parent(), data.name);
            });

            if($("#grid").find("div").length){
                $("#grid").find(".dataContent").eq(-1).addClass("list-items-bottom").after(pageStyleObj);
            }else{
                $(pageStyleObj).removeClass("list-items-bottom").appendTo("#grid");
            }
        }
        $("#grid").find(".list-items-bottom").last().removeClass("list-items-bottom");
    });
}

// 新增&修改Dialog
function insertDialog(uid, modifyItem, clickObject){
    // console.log(modifyItem);
    if(modifyItem == undefined){
        modifyItem = null;
    }
    var saveBtn = "";
    if(uid != undefined){
        title = "修改客戶資料";
        saveBtn = "修改";
    }else{
        title = "新增客戶資料";
        saveBtn = "新增";
    }
    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        start: function(){
          var option = {styleKind:"customers",style:"insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text");

            // 第二格是電話
            var phoneArea = $(insertPageObj).find(".list-items").eq(1).find("input:text");

            // 第一格是名字
            var addressArea = $(insertPageObj).find(".list-items").eq(2).find("input:text");
            var faxArea = $(insertPageObj).find(".list-items").eq(3).find("input:text");

            // 第二格是電話
            var org_numbersArea = $(insertPageObj).find(".list-items").eq(4).find("input:text");
            // 第一格是名字
            var principal_nameArea = $(insertPageObj).find(".list-items").eq(5).find("input:text");

            // 第二格是電話
            var principal_phoneArea = $(insertPageObj).find(".list-items").eq(6).find("input:text");
            // 第二格是電話
            var principal_mailArea = $(insertPageObj).find(".list-items").eq(7).find("input:text");
            
            if(modifyItem != undefined){
                nameArea.val(modifyItem.name);
                phoneArea.val(modifyItem.phone);
                addressArea.val(modifyItem.address);
                faxArea.val(modifyItem.fax);
                org_numbersArea.val(modifyItem["org_numbers"]);
                principal_nameArea.val(modifyItem["principal_name"]);
                principal_phoneArea.val(modifyItem["principal_phone"]);
                principal_mailArea.val(modifyItem["principal_mail"]);
            }

            // 放入
            $(insertPageObj).appendTo( $("#insertDialog").find(".modal-body") );

          });
        },
        button:[
            {
                text: saveBtn,
                className: "btn-success",
                click: function(){
                    var data = getUserInput("insertDialog");
                    if(uid != undefined){
                        data.uid = uid;
                         // console.log(data);
                    }
                    var isEmpty = false;
                    $.each(data, function(i,v){
                        if(i == "name" || i == "phone" || i == "address"){
                            if(!v){
                                $("#insertDialog").find("#"+i).addClass("item-bg-danger");
                                isEmpty = true;
                            }
                        }
                    });
                    // console.log(data);
                    if(isEmpty){
                        return;
                    }
                    // return;
                    saveData(data,clickObject);
                    $("#insertDialog").bsDialog("close");
                }
            },
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#insertDialog").bsDialog("close");
                }
            },
        ]
    });

}

// 儲存
function saveData(data,clickObject){
    var processAPI = "registered";
    if(data.uid != undefined){
        processAPI = "modify";
        clickObject.parents(".dataContent").find(".list-items").eq(0).text(data.name);
        clickObject.parents(".dataContent").find(".list-items").eq(1).text(data.address);
        clickObject.unbind("click").click(function(){
            insertDialog(data.uid, data, $(this));
        });
    }
    var sendData = {
        api:customersAPI + processAPI,
        threeModal: true,
        data:data
    };
    // console.log(data);
    $.post(wrsUrl, sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        // console.log(rs);
        
        // 新增
        if(data.uid == undefined){
            data.uid = rs.data.uid;
            data.admin = rs.data.admin;

            sendData = {
                api:customersAPI+"cuslist",
                threeModal: true,
                data:{
                    uid: rs.data.uid
                }
            };

            $.getJSON(wrsUrl, sendData, function(listData){
                putDataToPage(listData.data, true);
            });
        }
    });

}

// 修改結束日期
function modifyEndDate(content, modifyItem){
    $("#modifyEndDateDialog").remove();
    var modifyEndDateDialog = $("<div>").prop("id","modifyEndDateDialog");
    modifyEndDateDialog.appendTo("body");

    var limitTime = new Date();
    if(content.limitTime != "-"){
        var dateArr = content.limitTime.split("-");
        limitTime = new Date(dateArr[0],parseInt(dateArr[1])-1,dateArr[2]);
    }

    $("#modifyEndDateDialog").bsDialog({
        title: "系統使用期限",
        start: function(){
          var option = {styleKind:"customers",style:"setEndDate"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            $(insertPageObj).find("#endDateInfo").text(content.limitTime);
            var dateOption = {
                dateFormat: "yy-mm-dd",
                onSelect: function(dateText, inst) {
                    $(insertPageObj).find("#endDateInfo").text(dateText);
                },
                minDate: 0,
                defaultDate: limitTime
            };
            $(insertPageObj).find("#endDate").datepicker(dateOption);

            // 放入
            $(insertPageObj).appendTo( $("#modifyEndDateDialog").find(".modal-body") );

          });
        },
        button:[
            
            {
                text: "取消",
                className: "btn-default-font-color",
                click: function(){
                    $("#modifyEndDateDialog").bsDialog("close");
                }
            },
            {
                text: "儲存",
                className: "btn-success",
                click: function(){
                    var data = getUserInput("modifyEndDateDialog");
                    data.sysCodeID = content.codeID;
                    // return;
                    saveEndDate(data, content, modifyItem);
                    $("#modifyEndDateDialog").bsDialog("close");
                }
            }
        ]
    });
}

// 儲存
function saveEndDate(data, content, clickObject){
    var sendData = {
        api:customersAPI + 'useSystemLimitDate',
        threeModal: true,
        data:data
    };
    // console.log(data);
    $.post(wrsUrl, sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        if(rs.status){
            clickObject.find(".list-items").eq(3).text(data.endDate);
            content.limitTime = data.endDate;
            msgDialog(rs.msg);
        }else{
            msgDialog(rs.msg);
        }
    });

}

// // 刪除
// function deleteData(uid, removeItem, name){
//     var sendData = {
//         apiMethod: ctrlAuthorityDelAPI + "Delete_AssTypeGroup",
//         deleteObj:{
//             iUid: uid
//         }
//     };
//     // return;
//     $.post(configObject.deleteAPI,sendData,function(rs){
//         // console.log(rs);
//         rs = $.parseJSON(rs);
//         if(rs.Status){
//             removeItem.remove();
//             if(!$("#grid").find(".dataContent").length){
//                 var option = {styleKind:"system",style:"data-empty"};
//                 getStyle(option,function(pageStyle){
//                     $("#grid").html(pageStyle);
//                 });
//             }else{
//                 $("#grid").find(".dataContent").last().removeClass("list-items-bottom");

//             }

//         }else{
//             // 無法刪除
//             couldNotDeleteDialog(name);
//         }
//     });
// }

// 當無法刪除時，提供說明
function couldNotDeleteDialog(name){
    $("#couldNotDeleteDialog").remove();
    $("<div>").prop("id","couldNotDeleteDialog").appendTo("body");

    $("#couldNotDeleteDialog").bsDialog({
    start: function(){
        var string = name+" 已被使用，故無法刪除";
        $("#couldNotDeleteDialog").find(".modal-body").html(string);
    },
    button:[
        {
            text: "關閉",
            className: "btn-danger",
            click: function(){
                $("#couldNotDeleteDialog").bsDialog("close");
            }
        }
    ]
    });

}