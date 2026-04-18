$path = 'd:\z8\ALSDLC\livebox\Document\02_Requirement\tanh\LiveBox_Report3_Software_Requirement_Specification.docx'

try {
    $word = [System.Runtime.InteropServices.Marshal]::GetActiveObject("Word.Application")
} catch {
    $word = New-Object -ComObject Word.Application
}

try {
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
    
    # 1. DELETE previous attempt
    $findText = "2.1 Authentication & Onboarding"
    $range = $doc.Content
    $range.Find.Execute($findText) | Out-Null
    if ($range.Find.Found) {
        # Select from start of this text to the very end of the document, and delete it
        $range.End = $doc.Content.End
        $range.Delete() | Out-Null
    }
    
    $selection = $word.Selection
    $selection.EndKey(6) | Out-Null
    
    $selection.TypeParagraph()
    
    # Insert Feature Heading
    $selection.Style = "Heading 2"
    $selection.Font.Name = "Times New Roman"
    $selection.Font.Size = 14
    $selection.Font.ColorIndex = 2 # wdBlue (or match typical headings)
    $selection.TypeText("2.1 Authentication & Onboarding")
    $selection.TypeParagraph()
    
    # Insert Table Function
    function Build-UCTable {
        param (
            $UcName,
            $PrimaryActors,
            $SecondaryActors,
            $Desc,
            $Precond,
            $Postcond,
            $NormalFlow,
            $AltFlow
        )
        $selection.Style = "Heading 3"
        $selection.Font.Name = "Times New Roman"
        $selection.Font.Size = 13
        $selection.Font.ColorIndex = 0 # wdAuto
        $selection.TypeText($UcName)
        $selection.TypeParagraph()
        
        $table = $doc.Tables.Add($selection.Range, 7, 2)
        $table.Borders.Enable = 1 # Single line border
        $table.Range.Font.Name = "Times New Roman"
        $table.Range.Font.Size = 12
        $table.Range.Font.ColorIndex = 0 # Automatic
        
        # Format Left Column
        $table.Columns.Item(1).PreferredWidthType = 3 # Points
        $table.Columns.Item(1).PreferredWidth = 140
        # Light grey background for left column
        $table.Columns.Item(1).Shading.BackgroundPatternColor = 15132390 # A light gray (RGB: 230,230,230)
$table.Range.Cells.VerticalAlignment = 1 # Center vertically
        
        $fields = @("Primary Actors", "Secondary Actors", "Description", "Preconditions", "Postconditions", "Normal Sequence/Flow", "Alternative Sequences/Flows")
        $values = @($PrimaryActors, $SecondaryActors, $Desc, $Precond, $Postcond, $NormalFlow, $AltFlow)
        
        for ($i = 1; $i -le 7; $i++) {
            $cell1 = $table.Cell($i, 1).Range
            $cell1.Text = $fields[$i-1]
            $cell1.Font.Bold = 1
            
            $cell2 = $table.Cell($i, 2).Range
            $cell2.Text = $values[$i-1]
        }
        
        $selection.EndKey(6) | Out-Null
        $selection.TypeParagraph()
        $selection.TypeParagraph()
    }
    
    $desc1 = "As a Guest User, I want to register a new account using my email and password on a single straightforward screen, so that I can start using the LiveBox platform immediately within 30 seconds without complex registration barriers. (Reference: LB-101, BG-01)."
    $pre1 = "- The user has navigated to the LiveBox registration page.`n- The user does not currently have an active session on the platform."
    $post1 = "- A new user profile is successfully created and persisted in the PostgreSQL database.`n- The user is automatically authenticated and receives a stateless valid JWT Access Token alongside a Refresh Token.`n- The user is redirected to the main application interface or automatically joins a Server if navigating via an Invite Link."
    $norm1 = "1. The Guest User visits the registration page and inputs their email and password.`n2. The user clicks the 'Register' button.`n3. The System validates the input structure (e.g. valid email regex, strong password constraints).`n4. The System query the PostgreSQL database and verifies that the email is not already registered.`n5. The System creates the account, establishes an authenticated session, and generates a JWT Access Token and a Refresh Token.`n6. The System redirects the Guest User to their default home view."
    $alt1 = "Alternative Flow 1: Seamless Onboarding via Invite Link`n- In step 1, the Guest User arrives via an Invite Link (/invite/{code}).`n- In step 6, instead of being redirected to a default home view, the System triggers an auto-join action to the associated Server.`n`nAlternative Flow 2 (Error): Email Already Exists`n- In step 4, if the System detects the email is already persisted, it halts the process.`n- The System displays an inline error message: 'Email is already registered. Please log in.' and prompts the user to switch to the Login screen."

    Build-UCTable "UC-101: Register New Account (Đăng ký tài khoản mới)" "Guest User (P03 - Lan Anh)" "System" $desc1 $pre1 $post1 $norm1 $alt1
    
    $desc2 = "As a user, I want to securely log in using my credentials and maintain an active session, so that I don't have to repeatedly re-authenticate every time I open the LiveBox application. (Reference: LB-102, BG-05)."
    $pre2 = "- The user acts with an existing, valid account in the system.`n- The user's current session has expired, or they are logged out."
    $post2 = "- The user is successfully authenticated and granted access.`n- A valid JWT Access Token is loaded into the client runtime and a valid Refresh Token is persisted in the PostgreSQL DB.`n- A real-time WebSocket connection is initialized for messaging presence (Online status)."
    $norm2 = "1. The user navigates to the Login page.`n2. The user inputs their registered email and password.`n3. The user clicks the 'Login' button.`n4. The System verifies the credentials against the user table in PostgreSQL.`n5. Upon successful validation, the System dynamically constructs a JWT Access Token.`n6. The System creates a Refresh Token, stores it in the database for tracking.`n7. The System initializes a WebSocket connection and redirects the user to their last active Server or the main dashboard."
    $alt2 = "Alternative Flow 1: Silent Token Renewal (Session Maintenance)`n1. While actively using the platform, the frontend detects that the JWT Access Token is expired or about to expire.`n2. The frontend sends the valid Refresh Token to the System via a silent background request.`n3. The System verifies the Refresh Token state in the database.`n4. The System returns a newly minted JWT Access Token without forcing the user to interact with the login UI.`n`nAlternative Flow 2 (Error): Invalid Credentials`n1. In step 4, if the provided email or password fails the verification process, the System rejects the login attempt.`n2. The System returns a standardized error message: 'Invalid email or password.' and clears the password input field."
    
    Build-UCTable "UC-102: Login and Maintain Session (Đăng nhập và duy trì phiên làm việc)" "Server Owner (P01), Active Member (P02), Guest User (P03)" "System" $desc2 $pre2 $post2 $norm2 $alt2
    
    $doc.Save()
    Write-Output "Successfully generated table and written to docx"

} catch {
    Write-Output "Error:"
    Write-Output $_.Exception.Message
} finally {
    if ($word) {
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    }
}
