---
title: "TACO: The Tensor Algebra Compiler"
subtitle: A fast and versatile compiler-based library for sparse linear and tensor algebra
hero_link1: codegen.html
hero_link1_text: Try online 
hero_link2: https://github.com/tensor-compiler/taco
hero_link2_text: Download from GitHub 
hero_height: ""
layout: page
---

# What can I use TACO for?

TACO can be used to implement sparse linear and tensor algebra applications in a wide range of domains, such as...

{% include inline_callouts.html callouts="where_taco" %}

# Why should I use TACO?

{% include inline_callouts.html callouts="why_taco" %}

# How can I start using TACO?

The TACO code base is hosted on [GitHub](https://github.com/tensor-compiler/taco) and can be downloaded from there.
The code base includes a README that describes how to build the C++ and Python APIs and the command-line tool.

The [online documentation](docs/index.html) describes how to use the C++ and Python APIs as well as includes some example programs that show how TACO can be used.
The command-line tool also includes a help menu that documents all of its features; you can access the help menu by invoking the tool with the `--help` option.

You can also use TACO as a code generator [directly within your browser](codegen.html) without having to download it.

# How can I contribute to TACO?

If you encounter any bugs while using TACO or if you have any suggestions for improvements, please consider [creating an issue on GitHub](https://github.com/tensor-compiler/taco/issues).

We also [welcome pull requests](https://github.com/tensor-compiler/taco/pulls) if you would like to actively contribute by fixing bugs or implementing new features in TACO!

# Acknowledgements 

TACO is developed and maintained by members of [Prof. Fredrik Kjolstad](http://fredrikbk.com/)'s research group at Stanford University, members of the [COMMIT research group](http://groups.csail.mit.edu/commit/) (led by Prof. Saman Amarasinghe) at MIT CSAIL, and [other contributors](https://github.com/tensor-compiler/taco/graphs/contributors).

TACO is built on research supported by the National Science Foundation; the U.S. Department of Energy, Office of Science, Office of Advanced Scientific Computing Research; the Direction Générale de l'Armement; the Toyota Research Institute; the Application Driving Architectures (ADA) Research Center, a JUMP Center co-sponsored by SRC and DARPA; the Defense Advanced Research Projects Agency; the Google Research Scholar Program; and the Stanford Data Analytics for What’s Next (DAWN) Affiliate Program.
Any opinions, findings, and conclusions or recommendations expressed here are those of the developers of TACO and do not necessarily reflect the views of the aforementioned funding agencies.
