// api/withdrawalService.js
export const fetchWithdrawalRequests = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulated data
      return [
        {
          id: 1,
          user: "John Doe",
          amount: 500.0,
          status: "pending",
          date: "2024-10-25",
          accountNo: "**** 1234",
          bankName: "Chase Bank",
          swiftCode: "CHASUS33",
          email: "john.doe@example.com",
          previousWithdrawals: [
            { date: "2024-09-25", amount: 300.0, status: "completed" },
            { date: "2024-08-25", amount: 450.0, status: "completed" },
          ],
          accountBalance: 2500.0,
          withdrawalReason: "Monthly expense",
        },
        {
          id: 2,
          user: "John Doe",
          amount: 500.0,
          status: "pending",
          date: "2024-10-25",
          accountNo: "**** 1234",
          bankName: "Chase Bank",
          swiftCode: "CHASUS33",
          email: "john.doe@example.com",
          previousWithdrawals: [
            { date: "2024-09-25", amount: 300.0, status: "completed" },
            { date: "2024-08-25", amount: 450.0, status: "completed" },
          ],
          accountBalance: 2500.0,
          withdrawalReason: "Monthly expense",
        },
        {
          id: 3,
          user: "John Doe",
          amount: 500.0,
          status: "pending",
          date: "2024-10-25",
          accountNo: "**** 1234",
          bankName: "Chase Bank",
          swiftCode: "CHASUS33",
          email: "john.doe@example.com",
          previousWithdrawals: [
            { date: "2024-09-25", amount: 300.0, status: "completed" },
            { date: "2024-08-25", amount: 450.0, status: "completed" },
          ],
          accountBalance: 2500.0,
          withdrawalReason: "Monthly expense",
        },
        // Add more sample data
      ];
    } catch (error) {
      throw new Error("Failed to fetch withdrawal requests");
    }
  };
  
  export const approveWithdrawal = async (requestId, approvalData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, message: "Withdrawal approved successfully" };
    } catch (error) {
      throw new Error("Failed to approve withdrawal");
    }
  };
  