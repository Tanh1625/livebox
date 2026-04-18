$path = 'd:\z8\ALSDLC\livebox\Document\02_Requirement\tanh\LiveBox_Report3_Software_Requirement_Specification.docx'

try {
    # Check if we can get an active Word instance instead of opening a new one
    try {
        $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Word.Application")
    } catch {
        $word = New-Object -ComObject Word.Application
    }
    
    # Check if doc is already open
    $doc = $null
    foreach ($d in $word.Documents) {
        if ($d.FullName -eq $path) {
            $doc = $d
            break
        }
    }
    
    if (-not $doc) {
        $doc = $word.Documents.Open($path)
    }
    
    $selection = $word.Selection
    # Move to the end
    $selection.EndKey(6) | Out-Null
    
    $selection.TypeParagraph()
    
    # 2.1 Authentication & Onboarding
    $selection.Style = "Heading 2"
    $selection.TypeText("2.1 Authentication & Onboarding")
    $selection.TypeParagraph()
    
    # UC-101
    $selection.Style = "Heading 3"
    $selection.TypeText("UC-101: Register New Account (Đăng ký tài khoản)")
    $selection.TypeParagraph()
    
    $selection.Style = "Normal"
    $selection.Font.Bold = $true
    $selection.TypeText("Primary Actors")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("Guest User (P03 - Lan Anh)")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Secondary Actors")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("System")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Description")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("As a Guest User, I want to register a new account using my email and password on a single straightforward screen, so that I can start using the LiveBox platform immediately within 30 seconds without complex registration barriers. (Reference: LB-101, BG-01).")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Preconditions")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("- The user has navigated to the LiveBox registration page.`n- The user does not currently have an active session on the platform.")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Postconditions")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("- A new user profile is successfully created and persisted in the PostgreSQL database.`n- The user is automatically authenticated and receives a stateless valid JWT Access Token alongside a Refresh Token.`n- The user is redirected to the main application interface or automatically joins a Server if navigating via an Invite Link.")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Normal Sequence/Flow")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("1. The Guest User visits the registration page and inputs their email and password.`n2. The user clicks the 'Register' button.`n3. The System validates the input structure.`n4. The System query the PostgreSQL database and verifies that the email is not already registered.`n5. The System creates the account, establishes an authenticated session, and generates a JWT Access Token and a Refresh Token.`n6. The System redirects the Guest User to their default home view.")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Alternative Sequences/Flows")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("Alternative Flow 1: Seamless Onboarding via Invite Link`n- In step 1, the Guest User arrives via an Invite Link.`n- In step 6, instead of being redirected to a default home view, the System triggers an auto-join action to the associated Server.`n")
    $selection.TypeText("Alternative Flow 2 (Error): Email Already Exists`n- In step 4, if the System detects the email is already persisted, it halts the process.`n- The System displays an inline error message: 'Email is already registered. Please log in.' and prompts the user to switch to the Login screen.")
    $selection.TypeParagraph()
    
    $selection.TypeParagraph()
    
    # UC-102
    $selection.Style = "Heading 3"
    $selection.TypeText("UC-102: Login and Maintain Session (Đăng nhập và duy trì phiên làm việc)")
    $selection.TypeParagraph()
    
    $selection.Style = "Normal"
    $selection.Font.Bold = $true
    $selection.TypeText("Primary Actors")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("Server Owner (P01), Active Member (P02), Guest User (P03)")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Secondary Actors")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("System")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Description")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("As a user, I want to securely log in using my credentials and maintain an active session, so that I don't have to repeatedly re-authenticate every time I open the LiveBox application. (Reference: LB-102, BG-05).")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Preconditions")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("- The user acts with an existing, valid account in the system.`n- The user's current session has expired, or they are logged out.")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Postconditions")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("- The user is successfully authenticated and granted access.`n- A valid JWT Access Token is loaded into the client runtime and a valid Refresh Token is persisted in the PostgreSQL DB.`n- A real-time WebSocket connection is initialized for messaging presence (Online status).")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Normal Sequence/Flow")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("1. The user navigates to the Login page.`n2. The user inputs their registered email and password.`n3. The user clicks the 'Login' button.`n4. The System verifies the credentials against the user table in PostgreSQL.`n5. Upon successful validation, the System dynamically constructs a JWT Access Token.`n6. The System creates a Refresh Token, stores it in the database for tracking.`n7. The System initializes a WebSocket connection and redirects the user.")
    $selection.TypeParagraph()
    
    $selection.Font.Bold = $true
    $selection.TypeText("Alternative Sequences/Flows")
    $selection.Font.Bold = $false
    $selection.TypeParagraph()
    $selection.TypeText("Alternative Flow 1: Silent Token Renewal (Session Maintenance)`n1. While actively using the platform, the frontend detects that the JWT Access Token is expired or about to expire.`n2. The frontend sends the valid Refresh Token to the System via a silent background request.`n3. The System verifies the Refresh Token state in the database.`n4. The System returns a newly minted JWT Access Token without forcing the user to interact with the login UI.`n")
    $selection.TypeText("Alternative Flow 2 (Error): Invalid Credentials`n1. In step 4, if the provided email or password fails the verification process, the System rejects the login attempt.`n2. The System returns a standardized error message: 'Invalid email or password.' and clears the password input field.")
    $selection.TypeParagraph()

    $doc.Save()
    Write-Output "Successfully written to docx"

} catch {
    Write-Output "Error:"
    Write-Output $_.Exception.Message
} finally {
    if ($word) {
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    }
}
