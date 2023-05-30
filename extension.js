({
    name: "Bettle Car V1", // Category Name
    description: "Block for Bettle Car",
    author: "up-skill.asia",
    category: "Device Control",
    version: "1.0.0",
    icon: "/static/icon.png", // Category icon
    color: "#0271D9", // Category color (recommend some blocks color)
    blocks: [ // Blocks in Category
        {
            xml: `
                <block type="beservo">
                    <value name="pin">
                        <shadow type="math_number">
                            <field name="NUM">14</field>
                        </shadow>
                    </value>
                    <value name="beangle">
                        <shadow type="math_number">
                            <field name="NUM">90</field>
                        </shadow>
                    </value>
                </block>
            `
        }
    ]
});
