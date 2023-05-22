({
    name: "BettleV1", // Category Name
    description: "Block for Bettle Car",
    author: "upskill",
    category: "Device Control",
    version: "1.0.0",
    icon: "/static/icon.png", // Category icon
    color: "#0271D9", // Category color (recommend some blocks color)
    blocks: [ // Blocks in Category
        {
            xml: `
                <block type="bservo">
                    <value name="pin">
                        <shadow type="math_number">
                            <field name="NUM">14</field>
                        </shadow>
                    </value>
                    <value name="angle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>
            `
        }
    ]
});
