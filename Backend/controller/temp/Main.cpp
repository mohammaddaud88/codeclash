#include <bits/stdc++.h>
using namespace std;

string convertTo24Hour(string time) {
    string period = time.substr(time.size() - 2);  // "AM" or "PM"
    int hour = stoi(time.substr(0, 2));
    string minutes = time.substr(3, 2);
    string seconds = time.substr(6, 2);

    if (period == "AM") {
        if (hour == 12) hour = 0; // midnight
    } else { // PM
        if (hour != 12) hour += 12;
    }

    // format output
    ostringstream result;
    result << setw(2) << setfill('0') << hour << ":" << minutes << ":" << seconds;
    return result.str();
}

int main() {
    string time;
    cin >> time; // e.g. "07:05:45PM"

    cout << convertTo24Hour(time) << endl;
    return 0;
}
