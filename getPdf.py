import os
import requests
from lxml import etree

search_word = input("输入关键字,以逗号隔开")
words = search_word.split(",")

baseUrl = f"https://www.shuomingshu.cn/?s="
pageUrl = f"https://www.shuomingshu.cn/page/"


def get_max_page(word):
    response = requests.get(baseUrl + word)
    html = etree.HTML(response.text)
    page = html.xpath('//div[contains(@class,"pagination clearfix")]/span/text()')
    if len(page) == 0:
        return 0
    else:
        return int(page[0].split("/")[1])


def download(word):
    max_page = get_max_page(word) + 1
    if max_page == 1:
        print(f"{word}搜索无结果")
        return
    a_lists = []
    a_dict = []
    for page_no in range(1, max_page):
        search_url = ""
        if page_no == 1:
            search_url = baseUrl + word
        else:
            search_url = pageUrl + str(page_no) + "?s=" + word
        response = requests.get(search_url)
        html = etree.HTML(response.text)
        a_list = html.xpath('//h2/a')
        a_lists = a_lists + a_list

    for a in a_lists:
        a_dict.append((a.attrib["title"], a.attrib["href"]))
    print(f"{word}的文件总数{len(a_dict)}")
    word_dir = os.path.join(os.curdir, word)
    if not os.path.isdir(word_dir):
        os.mkdir(word_dir)
    for item in a_dict:
        r = requests.get(item[1])
        file_name = item[0].replace("/", "-", 10)
        file_path = os.path.join(word_dir, file_name)
        inner_html = etree.HTML(r.text)
        down = inner_html.xpath('//a[contains(@class,"downlink")]')
        r = requests.get(down[0].attrib["href"])
        print(f"开始下载:---{word}---{file_name}")
        with open(file_path, "wb") as f:
            for chunk in r.iter_content(1024):
                f.write(chunk)
        print(f"下载完成:---{word}---{file_name}")


def main():
    for word in words:
        download(word)


main()
