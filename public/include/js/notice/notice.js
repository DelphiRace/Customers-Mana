function showNoticeToast(msg) {
    // $().toastmessage('showNoticeToast', msg);
    $().toastmessage('showToast', {
        text     : msg,
        sticky   : true,
        position : 'top-right',
        type     : 'notice',
    });
}