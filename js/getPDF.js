javascript:(function calculateWorkingHours(window) {
    let searchWords = prompt("请输入搜索的关键字,以逗号隔开", "指南");
    let fileSize = prompt("请输入目标文件大小(只输入数字即可,单位:M)", "30");
    fileSize = Number(fileSize.split("M")[0]);
    if (searchWords === null || searchWords.trim().length === 0) {
        alert("输入错误");
        return;
    }
    const words = searchWords.split(",").map(word => word.trim());
    const searchURL = "https://ccpce-cn.consumer.huawei.com/ccpcmd/services/dispatch/secured/CCPC/EN/vsearch/newSearch/1000";
    const prefix = "https://consumer-tkb.huawei.com/weknow/servlet/show/knowAttachmentServlet?knowId=";
    const suffix = "&view=true";
    let fileNameIdList = new Map();

    async function send(word, pageNo) {
        return new Promise((resolve, reject) => {
            let searchParam = {
                knowledgeType: "3",
                applicable_region: "CN",
                language: "zh-cn",
                pageNo: pageNo,
                pageSize: 10,
                q: word,
                qAppName: "ServiceOfficial",
                scenarioDuplicate: true,
                site: "CN"
            };
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
            });
        })
    }

    function getData(res) {
        let totalSize = res.responseData.totalSize;
        let knowList = res.responseData.knowList;
        return [totalSize, knowList];
    }

    function download(url) {
        let iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
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
            if (totalSize > 0) {
                let pageNo = 0;
                if (totalSize > 100) {
                    pageNo = 10;
                } else {
                    pageNo = (Math.floor(totalSize / 10) + 1);
                }
                let list = [];
                for (let j = 1; j <= pageNo; j++) {
                    let res = [];
                    try {
                        res = await send(words[i], j);
                        await new Promise(((resolve, reject) => {
                            setTimeout(function () {
                                resolve();
                            }, 500);
                        }));
                    } catch (e) {
                        console.info(e);
                        return;
                    }
                    let knowList = getData(res)[1];
                    console.info({knowList});
                    let dList = knowList.filter(item => {
                        if (item._source.file_name
                            && item._source.file_size
                            && item._source.file_name.endsWith(".pdf")
                            && !(item._source.file_name.includes("认证信息"))) {
                            if (item._source.file_size.endsWith("KB")) {
                                return true;
                            }
                            return Number(item._source.file_size.split("M")[0]) <= fileSize;
                        } else {
                            return false;
                        }
                    });
                    if (dList.length >= 1) {
                        dList.forEach(item => {
                            let obj = {};
                            obj['fileName'] = item._source.file_name;
                            obj['url'] = prefix + item._id + suffix;
                            list.push(obj);
                        });
                    }
                }
                fileNameIdList.set(words[i], list);
                list = [];
            }
        }
        console.info({fileNameIdList});
        let urls = [];
        for (let list of fileNameIdList.values()) {
            let _urls = list.map(obj => obj["url"]);
            urls.push(..._urls);
        }
        console.info({urls});
        let urlsSet = new Set(Array.from(urls));
        console.info({urlsSet});
        urls.forEach(url => download(url));
    }

    main();
})(window)