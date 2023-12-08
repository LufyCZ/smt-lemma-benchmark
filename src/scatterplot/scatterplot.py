import matplotlib
import numpy as np

matplotlib.use('svg')

import matplotlib.pyplot as plt
import json

colors = {
  "lemma": "red",
  "stock": "blue",
  
  "cvc5-lemmas-cvc5": "red",
  "cvc5-lemmas-z3": "blue",
  "stock-cvc5": "green",
  "stock-z3": "orange",
  "z3-lemmas-cvc5": "purple",
  "z3-lemmas-z3": "brown",
}

f = open("./plot.json", "r")

data = json.load(f)

plt.figure(figsize=(11, 6))

benchmarkTypes = []

for benchmarkType in data:
  benchmarkTypes.append(benchmarkType)

fig1, ax = plt.subplots()

xdata = data[benchmarkTypes[0]]
ydata = data[benchmarkTypes[1]]

plt.scatter(
    x=xdata,
    y=ydata,
    color='blue',
    label=benchmarkTypes[0]
  )

# plt.axis('square')
ax.set_box_aspect(1)

maxval = max(max(xdata), max(ydata))

ax.set_xlim(left=-0.1, right=maxval*1.1)
ax.set_ylim(bottom=-0.1, top=maxval*1.1)

plt.axline((0, 0), slope=1, color="black", linestyle="dashed")

plt.xlabel(benchmarkTypes[0])
plt.ylabel(benchmarkTypes[1])

plt.subplots_adjust(right=0.7)

plt.savefig("./plot.png")

exit()