def simple_array_sum():
    # Read number of elements
    n = int(input().strip())
    
    # Read array (only if n > 0)
    if n > 0:
        arr = list(map(int, input().split()))
    else:
        arr = []
    
    # Compute sum
    result = sum(arr)
    
    # Print result
    print(result)


# Run the function
if __name__ == "__main__":
    simple_array_sum()
