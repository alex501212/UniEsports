import json

# Opening JSON file
f = open('institutions copy.json')

# returns JSON object as
# a dictionary
data = json.load(f)

# Iterating through the json
# list
requests = []
for i in data:
    for item in i["teams"]:
        item["requests"] = requests

json_object = json.dumps(data, indent=4)

with open("institutions copy.json", "w") as outfile:
    outfile.write(json_object)
# Closing file
f.close()
