import json
import os

import requests
from lxml import etree

domain = "https://detail.zol.com.cn"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/88.0.4324.190 Safari/537.36 ",
    "Referer": "https://detail.zol.com.cn/"
}


def getAllLinks():
    category_url = r"https://detail.zol.com.cn/xhr3_List_GetCategoryList.html"
    response = requests.get(category_url, headers=headers)
    html = etree.HTML(response.text)
    d = {}
    category_all_items = html.xpath("//div[@class='category-all-items']")
    for div in category_all_items:
        ddivs = div.xpath("./div")

        for ddiv in ddivs:
            name = "".join(ddiv.xpath("./strong/a/text()"))
            links = [x.replace("//", "https://") for x in ddiv.xpath("./div/a/@href")]
            names = [x.text for x in ddiv.xpath("./div/a")]
            d.update({name: dict(zip(names, links))})
    print(d)
    return d


def writeTo(json_file, file_name="allCategoryLinks.json", path="../中关村"):
    if not os.path.isdir(path):
        os.mkdir(path)
    with open(os.path.join(path, file_name), "w", encoding="utf-8") as f:
        f.write(json.dumps(json_file))


if __name__ == '__main__':
    all_links = getAllLinks()
    writeTo(all_links)
