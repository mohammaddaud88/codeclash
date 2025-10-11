#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;  // number of elements
    
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }

    long long sum = 0; // use long long to handle large sums
    for (int x : arr) {
        sum += x;
    }

    cout << sum << endl;
    return 0;
}
