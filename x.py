import requests
import json

headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}

data = json.dumps([
    {'md5': '123456798', 'url': 'http://2ch.hk/b/src/208209348/15747199440330.webm'}])

resp = requests.post('http://localhost:8000/check', data=data, headers=headers)

