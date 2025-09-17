# Read the number of integers
n = int(input())

# If n is 0, sum is 0
if n == 0:
    print(0)
else:
    # Read n integers and calculate their sum
    numbers = list(map(int, input().split()))
    print(sum(numbers))
