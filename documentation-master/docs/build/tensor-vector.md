**Basic Example**

In this section we consider a tensor-by-vector multiplication to quickly get started with the functionality of taco.

![Expression](/img/example_expressionfrompaper.png)

*Above: Tensor times vector operation.*


The paper discussed a use of a basic example with a sparse/dense matrix and a vector. The three variants are shown in the image below:


![Screenshot](/img/example_frompaper.png)

*Above: We have three different scenarios with depending on the desired situation.*

To see both how to use this on the command-line and through C++, we refer you to the next section: Mechanics.

We have provided support for this in the taco repository as well:

If you want to use it as a standalone app,
	Point the cmake build system to taco like so:

    export TACO_INCLUDE_DIR=<path to taco src dir>
    export TACO_LIBRARY_DIR=<path to taco lib dir>

Build the tensor_times_vector example like so:

    mkdir build
    cd build
    cmake ..
    make

Run the explicit tensor_times_vector example like so:

    ./tensor_times_vector
