# User Flow - Simplified (Thai Tour Website)

> เอกสารนี้อธิบายขั้นตอนการใช้งานระบบแบบ **Simplified** ที่เหมาะสำหรับนักศึกษาปี 1

---

## Overview

**Simplifications:**
- ❌ Email verification → Skip in v1.0
- ❌ Password reset → Admin reset instead
- ❌ Email Queue → console.log()
- ❌ Audit Logs → console.log()

---

## 1. Customer User Flows

### 1.1 Registration & Login

```mermaid
flowchart TD
    Start([Enter Website]) --> Choice{Have Account?}

    Choice -- No --> Register[Register Page]
    Register --> InputReg[Enter: Email, Password, Name]
    InputReg --> SubmitReg[Submit]
    SubmitReg --> CreateAcc[Create Account]
    CreateAcc --> Home[Home Page]

    Choice -- Yes --> Login[Login Page]
    Login --> InputLog[Enter Email + Password]
    InputLog --> SubmitLog[Login]
    SubmitLog --> GenToken[Generate JWT]
    GenToken --> Home

    style Start fill:#E1F5FE
    style Home fill:#C8E6C9
```

---

### 1.2 Search & Browse Tours

```mermaid
flowchart TD
    Home([Home Page]) --> Browse[Browse Tours]

    Browse --> WantSearch{Want to Search?}

    WantSearch -- Yes --> Search[Search Tours]
    Search --> Filters[Select: Region, Category, Price]
    Filters --> Results[Show Results]

    WantSearch -- No --> ShowAll[Show All Tours]
    ShowAll --> Results

    Results --> Select[Click Tour]
    Select --> Detail[Tour Detail Page]

    Detail --> Decide{Want to Book?}

    Decide -- No --> Browse
    Decide -- Yes --> StartBooking[Start Booking]

    style Home fill:#E1F5FE
    style StartBooking fill:#C8E6C9
```

---

### 1.3 Booking Flow

```mermaid
flowchart TD
    Start([Tour Detail]) --> ClickBook[Click Book Now]

    ClickBook --> CheckLogin{Logged In?}

    CheckLogin -- No --> Login[Go to Login]
    Login --> Back[Return to Booking]

    CheckLogin -- Yes --> Back

    Back --> Form[Booking Form]
    Form --> InputDate[Select Travel Date]
    InputDate --> InputPax[Enter Number of People]
    InputPax --> Calc[Calculate Price]
    Calc --> ShowPrice[Show Total Price]

    ShowPrice --> Confirm{Confirm?}

    Confirm -- No --> Detail

    Confirm -- Yes --> CheckStock{Check Availability}

    CheckStock -- No Stock --> Error[Show Error]
    Error --> Detail

    CheckStock -- Available --> Create[Create Booking]
    Create --> GenQR[Generate QR Code]
    GenQR --> ShowQR[Show QR + 24h Deadline]

    ShowQR --> Pay{Will Pay Now?}

    Pay -- No --> Wait[Wait for Payment]
    Pay -- Yes --> Upload[Upload Slip]

    style Start fill:#E1F5FE
    style ShowQR fill:#FFF9C4
    style Upload fill:#C8E6C9
```

---

### 1.4 Payment Flow

```mermaid
flowchart TD
    Upload([Upload Slip]) --> Validate{Validate File}

    Validate -- Invalid --> ShowError[Show Error]
    ShowError --> Upload

    Validate -- Valid --> Hash[Calculate SHA-256]
    Hash --> CheckDup{Check Duplicate}

    CheckDup -- Duplicate --> DupError[Show Duplicate Error]
    DupError --> Upload

    CheckDup -- New --> Save[Save Payment]
    Save --> Log[console.log Notify Admin]
    Log --> Wait[Wait for Verification]

    Wait --> Admin{Admin Decision}

    Admin -- Reject --> Reject[Payment Rejected]
    Reject --> Reason[Show Reason]
    Reason --> Upload

    Admin -- Approve --> Success[Payment Approved]
    Success --> Ticket[Generate E-Ticket]

    style Upload fill:#E1F5FE
    style Success fill:#C8E6C9
    style Reject fill:#FFCDD2
```

---

### 1.5 My Bookings

```mermaid
flowchart TD
    LoggedIn([Logged In]) --> Profile[Go to Profile]
    Profile --> MyBookings[My Bookings Page]

    MyBookings --> Load[Load Bookings]
    Load --> List[Show Booking List]

    List --> Select{Select Booking}

    Select --> Click[Click Booking]
    Click --> Detail[Booking Detail]

    Detail --> Actions{Available Actions}

    Actions -- View Ticket --> Ticket[View E-Ticket]
    Actions -- Cancel --> Cancel[Cancel Booking]
    Actions -- Upload --> UploadPage[Upload Slip]
    Actions -- Back --> MyBookings

    Cancel --> CheckStatus{Check Status}

    CheckStatus -- Can Cancel --> DoCancel[Cancel Booking]
    DoCancel --> Release[Release Seats]
    Release --> MyBookings

    CheckStatus -- Cannot Cancel --> Cannot[Show Cannot Cancel]
    Cannot --> Detail

    style LoggedIn fill:#E1F5FE
    style Ticket fill:#C8E6C9
```

---

## 2. Admin User Flows

### 2.1 Admin Login

```mermaid
flowchart TD
    Start([Go to /admin]) --> Login[Admin Login Page]
    Login --> Input[Enter Email + Password]
    Input --> Submit[Submit]
    Submit --> Validate{Validate}

    Validate -- Invalid --> Error[Show Error]
    Error --> Input

    Validate -- Valid --> CheckRole{Check Role}

    CheckRole -- Not Admin --> Forbidden[Access Denied]
    Forbidden --> Start

    CheckRole -- Admin --> Dashboard[Admin Dashboard]

    style Start fill:#E1F5FE
    style Dashboard fill:#C8E6C9
```

---

### 2.2 Manage Tours

```mermaid
flowchart TD
    Dashboard([Dashboard]) --> Menu[Click Manage Tours]
    Menu --> List[Tour List]

    List --> Action{Select Action}

    Action -- Add --> Add[Add New Tour]
    Add --> AddForm[Fill Form]
    AddForm --> SaveAdd[Save]
    SaveAdd --> List

    Action -- Edit --> Edit[Edit Tour]
    Edit --> EditForm[Edit Form]
    EditForm --> SaveEdit[Save]
    SaveEdit --> List

    Action -- Delete --> Delete[Delete Tour]
    Delete --> Confirm{Confirm?}

    Confirm -- No --> List
    Confirm -- Yes --> DoDelete[Delete]
    DoDelete --> List

    style Dashboard fill:#E1F5FE
    style List fill:#FFF9C4
```

---

### 2.3 Verify Payments

```mermaid
flowchart TD
    Dashboard([Dashboard]) --> Menu[Click Verify Payments]
    Menu --> Load[Load Pending Payments]
    Load --> List[Show Pending List]

    List --> Select{Select Payment}

    Select --> View[View Payment Detail]
    View --> Show[Show Slip + Details]

    Show --> Decide{Admin Decision}

    Decide -- Approve --> Approve[Click Approve]
    Approve --> ProcessApprove[Process Approval]
    ProcessApprove --> UpdatePay[Update: approved]
    UpdatePay --> UpdateBook[Update: confirmed]
    UpdateBook --> Log[console.log Email]
    Log --> List

    Decide -- Reject --> Reject[Click Reject]
    Reject --> InputReason[Input Reason]
    InputReason --> ProcessReject[Process Rejection]
    ProcessReject --> UpdateReject[Update: rejected]
    UpdateReject --> UpdatePending[Update: pending_pay]
    UpdatePending --> LogReject[console.log Email]
    LogReject --> List

    style Dashboard fill:#E1F5FE
    style List fill:#E1F5FE
```

---

### 2.4 Dashboard Stats

```mermaid
flowchart TD
    Login([Admin Login]) --> Dashboard[Dashboard Page]

    Dashboard --> LoadStats[Load Statistics]

    LoadStats --> ShowStats[Show Stats]
    ShowStats --> Cards[Stats Cards]

    Cards --> Revenue[Total Revenue]
    Cards --> Today[Today Bookings]
    Cards --> Pending[Pending Payments]

    Revenue --> Action{Select Action}
    Today --> Action
    Pending --> Action

    Action -- Tours --> Tours[Manage Tours]
    Action -- Payments --> Payments[Verify Payments]
    Action -- Reports --> Reports[View Reports]

    style Login fill:#E1F5FE
    style Dashboard fill:#FFF9C4
```

---

## 3. Error Handling Flows

### 3.1 Common Errors

```mermaid
flowchart TD
    Start([User Action]) --> System[System Check]

    System --> Error{Error Type}

    Error -- Network --> NetErr[Network Error]
    NetErr --> ShowNet[Show: Check Internet]
    ShowNet --> Retry[Retry]
    Retry --> Start

    Error -- Validation --> ValErr[Validation Error]
    ValErr --> ShowVal[Show Field Errors]
    ShowVal --> Fix[Fix Input]
    Fix --> Start

    Error -- Auth --> AuthErr[Not Logged In]
    AuthErr --> ShowAuth[Show: Please Login]
    ShowAuth --> LoginPage[Login Page]

    Error -- Server --> ServErr[Server Error]
    ServErr --> ShowServ[Show: Try Again Later]

    style Start fill:#E1F5FE
    style LoginPage fill:#FFF9C4
    style NetErr fill:#FFCDD2
    style ValErr fill:#FFCDD2
```

---

## 4. Booking Status Flow

```mermaid
stateDiagram-v2
    [*] --> pending_pay : Customer creates booking
    pending_pay --> pending_verify : Customer uploads slip
    pending_pay --> expired : 24h timeout
    pending_pay --> cancelled : Customer cancels

    pending_verify --> confirmed : Admin approves
    pending_verify --> pending_pay : Admin rejects

    confirmed --> [*] : Complete

    expired --> [*]
    cancelled --> [*]
```

---

## 5. Summary of Simplifications

| Flow | Original | Simplified |
|---|---|---|
| Email Verification | Required | Skip in v1.0 |
| Password Reset | Self-service | Admin reset |
| Email Queue | Queue system | console.log() |
| Audit Logs | Database table | console.log() |
| Session Management | Session table | JWT only |

---

## 6. Estimated Time

| Process | Time |
|---|---|
| Register | 1-2 min |
| Login | 30 sec |
| Search Tours | 3-5 min |
| Book Tour | 2-3 min |
| Upload Slip | 1-2 min |
| Verify Payment | ~12 hours (SLA) |

---

**Last Updated:** 2026-02-10
**Status:** Simplified for Year 1 Students 🚀
