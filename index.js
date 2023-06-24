const tokenStringeeX = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2NvdW50X2lkIjoiQUNRRTM1NjI3TyIsImRpc3BsYXlOYW1lIjoiS1x1MWVmMyBDWCIsImF2YXRhclVybCI6bnVsbCwicG9ydGFsX2lkIjoiUFQxODQ0RE82VCIsImFjY291bnRfcG9ydGFsX2lkIjoiUEFVUTRFSDZORSIsImV4cCI6MTcxODU5MzA5Mywia2V5X2lkIjoiS0VZUU1CNVFBMiJ9.e1nHqaAW32pqV7P6ukky0DcRLxpjpXg0VciCNNXErxU";
let callHistoryData = [];

function getData() {
    var url = "https://nguyenduykytest.stringeex.com/v1/call/history?version=2&page=1&limit=50&order_direction=first&sort_order=desc&sort_by=start_time&dir=ltr";
    $.ajax({
        url: url + "&access_token=" + tokenStringeeX,
        dataType: 'json',
        success: function (res) {
            var maxRows = res.data.rows;
            var totalData = Number(res.data.totalCount);
            var maxPages = Math.floor(totalData / 50) + 1;
            if (totalData > 50) {
                for (var page = 2; page <= maxPages; page++) {
                    var url = "https://nguyenduykytest.stringeex.com/v1/call/history?time=&limit=50&order_direction=first&sort_order=desc&sort_by=start_time&dir=ltr&page=" + page + "&access_token=" + tokenStringeeX;
                    $.ajax({
                        url: url + "&access_token=" + tokenStringeeX,
                        dataType: 'json',
                        success: function (res) {
                            maxRows = maxRows.concat(res.data.rows);
                            if (maxRows.length === totalData) {
                                showData(maxRows);
                            }
                        }
                    });
                }
            }
        },
    });
}

function showData(data) {
    callHistoryData = data.map(e => {
        return {
            id: e.id,
            customer_number: e.customer_number,
            stringee_number: e.stringee_number,
            direction: checkDirection(e.direction),
            start_time: convertTimestampMilisecond(e.start_time),
            end_time: convertTimestampMilisecond(e.end_time),
            queue_duration: e.queue_duration,
            talk_duration: e.talk_duration,
            account_name: e.account_name,
            queue_id: e.queue_id,
            hold_duration: e.hold_duration,
            end_call_reason: e.end_call_reason,
            end_call_by: e.end_call_by,
            status: checkStatusCall(e.status)
        };
    });
    //Column title
    let html =
        '<tr><td>Mã cuộc gọi</td><td>Số khách hàng</td><td>Số tổng đài</td><td>Loại cuộc gọi</td><td>Thời điểm bắt đầu</td><td>Thời điểm kết thúc</td><td>Thời gian chờ</td><td>Thời gian đàm thoại</td><td>Agent tiếp nhận cuối cùng</td><td>Mã hàng đợi</td><td>Thời gian giữ máy</td><td>Mã kết thúc</td><td>Kết thúc bởi</td><td>Trạng thái thoại</td></tr>';
    //Row data
    $.each(callHistoryData, function (key, value) {
        html += '<tr>';
        html += '<td>' + value.id + '</td>';
        html += '<td>' + value.customer_number + '</td>';
        html += '<td>' + value.stringee_number + '</td>';
        html += '<td>' + value.direction + '</td>';
        html += '<td>' + value.start_time + '</td>';
        html += '<td>' + value.end_time + '</td>';
        html += '<td>' + value.queue_duration + '</td>';
        html += '<td>' + value.talk_duration + '</td>';
        html += '<td>' + value.account_name + '</td>';
        html += '<td>' + value.queue_id + '</td>';
        html += '<td>' + value.hold_duration + '</td>';
        html += '<td>' + value.end_call_reason + '</td>';
        html += '<td>' + value.end_call_by + '</td>';
        html += '<td>' + value.status + '</td>';
        html += '</tr>';
    });
    $('table tbody').html(html);
}

function checkStatusCall(data) {
    var status = "";
    switch (data) {
        case 1:
            status = "Cuộc gọi gặp";
            break;
        case 2:
            status = "Cuộc gọi nhỡ";
            break;
        case 3:
            status = "Dừng ở IVR";
            break;
        case 4:
            status = "Dừng ở khảo sát khách hàng";
            break;
        default:
            break;
    }
    return status;
}

function checkDirection(data) {
    var direction = "";
    switch (data) {
        case 0:
            direction = "Gọi ra";
            break;
        case 1:
            direction = "Gọi vào";
            break;
        case 2:
            direction = "Gọi nội bộ";
            break;
        default:
            break;
    }
    return direction;
}

function convertTimestampMilisecond(data) {
    if (data != 0) {
        var dateObj = new Date(Number(data));
        var formattedDate = dateObj.getHours() + ":" + dateObj.getMinutes() + ":" + dateObj.getSeconds() + ", " + dateObj.getDate() + "/" + (dateObj.getMonth() + 1) + "/" + dateObj.getFullYear();
        return formattedDate;
    }
    else {
        return "Không có";
    }

}

function exportToExcel(fileName, sheetName, table) {
    if (callHistoryData.length === 0) {
        console.error('Chưa có data');
        return;
    }
    console.log('exportToExcel', callHistoryData);
    let wb;
    if (table && table !== '') {
        wb = XLSX.utils.table_to_book($('#' + table)[0]);
    } else {
        const ws = XLSX.utils.json_to_sheet(callHistoryData);
        // console.log('ws', ws);
        wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
    }
    console.log('wb', wb);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
}