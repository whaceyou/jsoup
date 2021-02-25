(function calculateWorkingHours(window) {
    let searchWords = prompt("请输入搜索的关键字,以逗号隔开", "指南");
    const words = searchWords.split(",").map(word => word.trim());
    const searchURL = "https://ccpce-cn.consumer.huawei.com/ccpcmd/services/dispatch/secured/CCPC/EN/vsearch/newSearch/1000";
    const prefix = "https://consumer-tkb.huawei.com/weknow/servlet/show/knowAttachmentServlet?knowId=";
    const suffix = "&view=true";

    let downIds = [];

    async function send(word, pageNo) {
        return new Promise((resolve, reject) => {
            let searchParam = {
                applicable_region: "CN",
                language: "zh-cn",
                pageNo: (pageNo + 1),
                pageSize: 10,
                q: word,
                qAppName: "ServiceOfficial",
                scenarioDuplicate: true,
                site: "CN"
            }
            $.ajax({
                type: "POST",
                url: searchURL,
                contentType: "application/json",
                data: JSON.stringify(searchParam),
                success: function (result) {
                    resolve(result);
                },
                error: function (error) {
                    reject(error);
                }
            })

        })
    }

    function getData(res) {
        let totalSize = res.responseData.totalSize;
        let knowList = res.responseData.knowList;
        return [totalSize, knowList]
    }

    async function main() {
        for (let i = 0; i < words.length; i++) {
            let totalSize = 0;
            try {
                const res = await send(words[i], 1);
                totalSize = getData(res)[0];
            } catch (e) {
                console.info(e);
            }
            console.info({totalSize});

            if (totalSize >= 0) {
                for (let j = 0; j < 10; j++) {
                    try {
                        const res = await send(words[i], j);
                        let knowList = getData(res)[1];
                        console.info({knowList});
                        let dList = knowList.filter(item => item._source.file_name && item._source.file_name.endsWith(".pdf") && item._source.downloadnum > 0);
                        if (dList.length >= 1) {
                            dList.forEach(item => downIds.push(item._id));
                        }
                    } catch (e) {
                        console.info(e);
                    }
                }
                let urls = new Set(Array.from(downIds.map(item => (prefix + item + suffix).toString())));
                console.info({urls});
                urls.forEach(url => {
                    let iframe = document.createElement("iframe");
                    iframe.src = url;
                    iframe.style.display = 'none';
                    document.body.append(iframe);
                    }
                )
            } else {
                alert("没有可以下载的文件!")
            }
        }
    }

    main();

})(window)