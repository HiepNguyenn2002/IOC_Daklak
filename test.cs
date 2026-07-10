using System;
using System.Text.Json;

class User {
    public string Username { get; set; }
}

class Program {
    static void Main() {
        string json = "{\"username\": \"test\"}";
        var user = JsonSerializer.Deserialize<User>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        Console.WriteLine("Username is: " + (user.Username ?? "NULL"));
    }
}
