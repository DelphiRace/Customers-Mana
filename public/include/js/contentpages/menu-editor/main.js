$(function(){
    getMenuData();
});
var meunData;
var treeView;

function getMenuData(){
    loader($("#treeArea"));
    var sendData = {
        api: ctrlAuthorityAPI+"GetData_AssTypeGroup",
        data: {}
    }
    
    // ＡＰＩ呼叫
    $.getJSON( wrsAPI + "menuAPI/userMenuPositionList" ).done(function(rs){
        if(rs.status){
            $("#treeArea").empty();
            var options = {
                idName: "uid",
                title: "memo",
            }

            meunData = processTreeDataOnly(rs.data,options);

            treeView = $("#treeArea").treeView({
                data: meunData[0],
                // expansion: false,
                // expansionLevel: 1,
                editorBtn:{
                    insertBtn: '<i class="fa fa-plus-circle"></i>',
                    modifyBtn: '<i class="fa fa-pencil-square-o"></i>',
                    deleteBtn: '<i class="fa fa-trash-o"></i>' 
                },
                checkbox:false,
                editor:{
                    insertBtn: function(data, object){
                        // console.log(object.parent(), $(object).index( 'li.treeContent' ));
                        // console.log($(object).index() , $(object.parent()).index() );
                        // console.log($( object.parents(".treeViewContent").eq(0) ).index(), object.parents(".treeViewContent").eq(0));
                        // console.log($( object.parents(".treeViewContent").eq(0) ).index(), object.parents(".treeViewContent").eq(0));
                        // console.log(object.parent().parents(),$("#treeArea").index(object));
                        insertDialog( data, object );
                    },
                    modifyBtn: function(data, object){
                        console.log(data);
                        insertDialog( data, object, true );
                    },
                    deleteBtn: function(data){
                        console.log(data);
                    }
                }
            });
            // console.log(meunData);
        }
    });
}

// 新增&修改Dialog
function insertDialog(treeViewData,clickObject,modifyStatus){
    // console.log(treeView.getParents(treeViewData.id));
    var treeViewDataIsNull = false;
    if(treeViewData == undefined){
        treeViewData = {};
    }

    if(Object.size(treeViewData)){
        var parentArr = treeView.getParents(treeViewData.id);
    }else{
        treeViewDataIsNull = true;
    }
    // console.log(treeViewData);
    if(modifyStatus == undefined){
        modifyStatus = false;
    }
    var saveBtn = "";
    if(modifyStatus){
        title = "修改系統功能選單";
        saveBtn = "修改";
    }else{
        title = "新增系統功能選單";
        saveBtn = "新增";
    }

    $("#insertDialog").remove();
    var insertDialog = $("<div>").prop("id","insertDialog");
    insertDialog.appendTo("body");

    $("#insertDialog").bsDialog({
        title:title,
        start: function(){
          var option = {styleKind:"menu-editor",style:"menu-editor-insert"};
          getStyle(option,function(insertPage){
            var insertPageObj = $.parseHTML(insertPage);

            $(insertPageObj).find(".row").removeClass("row").addClass("contents");
            // 第一格是名字
            $(insertPageObj).find(".list-items").eq(0).find(".control-label").text("系統名稱");
            var nameArea = $(insertPageObj).find(".list-items").eq(0).find("input:text").addClass("userInput").prop("id","memo");

            // 第二格是url
            $(insertPageObj).find(".list-items").eq(1).find(".control-label").text("URL");
            var urlArea = $(insertPageObj).find(".list-items").eq(1).find("input:text").addClass("userInput").prop("id","url");
            
            // 第三格是nid
            $(insertPageObj).find(".list-items").eq(2).find(".control-label").text("多語系ID");
            var nidkArea = $(insertPageObj).find(".list-items").eq(2).find("input:text").addClass("userInput").prop("id","nid");
            
            // 第四格是父層相關資訊
            var parentInfo = "";
            if(!treeViewDataIsNull){
                if(parentArr.length){
                    for(var i = (parentArr.length - 1); i >= 0 ; i--){
                        parentInfo += parentArr[i]["memo"] + " > ";
                        // console.log(parentArr[i]);
                    }
                    if(!modifyStatus){
                        parentInfo += treeViewData.memo;
                    }else{
                        parentInfo = parentInfo.substring(0,parentInfo.length-3);
                    }
                }else{
                    
                    if(!modifyStatus){
                        parentInfo = treeViewData.memo;
                    }else{
                        parentInfo = "Root";
                    }
                    
                }
            }else{
                parentInfo = "Root";
            }

            $(insertPageObj).find(".list-items").eq(3).find(".control-label").eq(0).text("所屬父層");
            $(insertPageObj).find(".list-items").eq(3).find(".control-label").eq(1).text(parentInfo);
            // var remarkArea = $(insertPageObj).find(".list-items").eq(3).find("input:text").addClass("userInput").prop("id","nid");

            if(modifyStatus){
                nameArea.val(treeViewData.memo);
                urlArea.val(treeViewData.url);
                nidkArea.val(treeViewData.nid);
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
                    var sequence = 0;
                    if(modifyStatus){
                        data.parent = treeViewData.parent;
                        data.uid = treeViewData.uid;                        
                    }else{
                        if(treeViewDataIsNull){
                            data.parent = 0;
                        }else{
                            data.parent = treeViewData.uid;
                        }
                    }

                    if(treeViewData != undefined){
                        if(treeViewData.parent == 0){
                            $(clickObject).find(".treeViewContent").filter(function(){
                                var parent = $(this).parent().prop("class").search("roots");
                                if(parent != -1){
                                    sequence++;
                                }
                            });
                        }else{
                            sequence = (clickObject.parent() != undefined)?$(clickObject.parent()).index():$(clickObject).index();

                        }
                    }else{
                        sequence = $(clickObject.parent()).index();
                    }
                    data.sequence = sequence;
                    // console.log(data);
                    // return;
                    // if(uid != undefined){
                    //     data.uid = uid;
                    //      // console.log(data);
                    // }
                    // data.gpname = $("#insertDialog").find("#groupid :selected").text();
                    var isNull = false;
                    $.each(data,function(i,v){
                        if($.trim(v) == ""){
                            isNull = true;
                        }
                    });
                    if(!isNull){
                        saveData(data,clickObject, treeViewDataIsNull);
                        // $("#insertDialog").bsDialog("close");
                    }
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
function saveData(data, clickObject, treeViewDataIsNull){

    var processAPI = "menuInsert";

    if(data.uid != undefined){

        processAPI = "menuModify";

    }

    var sendData = data;
    // console.log(data);
    // console.log(sendData);
    $.post( menuRSUrl + processAPI, sendData, function(rs){
        console.log(rs);
        
        rs = $.parseJSON(rs);
        if(rs.status){
        // 新增
            // if(treeViewDataIsNull){
                $.getJSON( wrsAPI + "menuAPI/userMenuPositionList" ).done(function(rs){
                    if(rs.status){
                        $("#treeArea").empty();
                        var options = {
                            idName: "uid",
                            title: "memo",
                        }
                        meunData = processTreeDataOnly(rs.data, options);
                        treeView.reload({data:meunData[0]});
                        // console.log(meunData);
                    }
                });
                
            // }
            $("#insertDialog").bsDialog("close");
        }
    });

}

// 刪除
function deleteData(uid, removeItem, name){
    var sendData = {
        apiMethod: ctrlAuthorityDelAPI + "Delete_AssBaseGroup",
        deleteObj:{
            iUid: uid
        }
    };
    // return;
    $.post(configObject.deleteAPI,sendData,function(rs){
        // console.log(rs);
        rs = $.parseJSON(rs);
        if(rs.Status){
            removeItem.remove();
            if(!$("#grid").find(".dataContent").length){
                var option = {styleKind:"system",style:"data-empty"};
                getStyle(option,function(pageStyle){
                    $("#grid").html(pageStyle);
                });
            }else{
                $("#grid").find(".dataContent").last().removeClass("list-items-bottom");

            }

        }else{
            // 無法刪除
            couldNotDeleteDialog(name);
        }
    });
}

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