/* Newton's fullest diagram of Revelation.
   Yahuda MS 7.2a, ff. 35v–39r, "A Synopsis of the Synchronisms of the Apocalypse"
   (two holograph copies). Historical names are from the key on f. 35v and the
   dynasty essay at the opening of the same manuscript. Where a later computation
   in these papers revises a date, the gloss says so.
   Ranges are chapter:verse in the King James Version. `home` verses are read at
   this moment in his order. `also` verses are lines he points back to. */
window.DIAGRAM_ADJUSTED = {
  upperColumns: [
    { id: "ch", title: "Seven churches", sub: "Rev 2–3. Seven states of one church." },
    { id: "seal", title: "Seals opened", sub: "Rev 6. Seven heads, one after another." },
    { id: "drag", title: "The dragon", sub: "Rev 12, read in these same years." }
  ],
  lowerColumns: [
    { id: "wind", title: "Winds", sub: "Rev 7", half: "open" },
    { id: "trump", title: "Trumpets", sub: "Rev 8–9", half: "open" },
    { id: "thun", title: "Thunders", sub: "Rev 10", half: "open" },
    { id: "wit", title: "Witnesses", sub: "Rev 11", half: "open" },
    { id: "beast", title: "Beasts and Zion", sub: "Rev 13–14", half: "eat" },
    { id: "vial", title: "Vials", sub: "Rev 16", half: "eat" },
    { id: "whore", title: "The whore", sub: "Rev 17–19", half: "eat" }
  ],
  bands: {
    prologue: {
      id: "prologue",
      year: "Nero’s end",
      kicker: "Before the prophecy",
      cells: [{
        id: "prologue",
        ref: "Rev 1",
        excerpt: "John on Patmos. Write the things which thou hast seen, and the things which are, and the things which shall be hereafter.",
        when: "He dates the book to the end of Nero’s reign, before Jerusalem falls.",
        gloss: "The published Observations open on this point. Newton argued that John wrote before the destruction of the city, so the prophecy does not describe that war as already past. The seven letters, on this reading, are not a tour of Asia. They are seven states of the one church, and the states begin as the book begins.",
        home: ["1:1-20"]
      }]
    },
    throne: {
      id: "throne",
      year: "The door opened",
      kicker: "Revelation 4–5, the frame of the sealed book",
      cells: [{
        id: "throne",
        ref: "Rev 4–5",
        excerpt: "A door opened in heaven. The Lamb takes the book out of the right hand of him that sat upon the throne.",
        when: "The temple opened. The same door opens again at 11:19.",
        gloss: "Newton reads chapters 4 and 5 as the daily worship of the first temple. The sealed book is the book Daniel was told to seal. Its writing “within and on the backside” is his warrant for synchronisms: two texts for one time. The second half of the Apocalypse, he says, begins when this door opens again at 11:19, and John eats the open book.",
        home: ["4:1-11", "5:1-14"]
      }]
    },
    hinge: {
      id: "hinge",
      year: "11:19",
      kicker: "The door of the other telling is 11:19. Revelation 10 is not this door. That box is the mark of the end of the 1,260, on the lower chart.",
      cells: [
        {
          id: "hinge-door",
          ref: "Rev 11:19",
          excerpt: "The temple of God was opened in heaven, and there was seen in his temple the ark of his testament.",
          when: "In the scroll this verse stands after the seventh trumpet. On the diagram it is the door of the second vision.",
          gloss: "One verse, two jobs. In chapter order it closes the trumpet vision, after the seventh angel has sounded. On the synopsis it is the second opening of the temple, parallel to chapters 4 and 5, and it stands at the head of the dragon column. The woman and the dragon are then read in the years of the seals. Eating the book is the warrant to prophesy again. The chapter of that eating, Revelation 10, is set at the end of the 1,260.",
          home: ["11:19"]
        }
      ]
    },
    epilogue: {
      id: "epilogue",
      year: "The close",
      kicker: "After the vision",
      cells: [{
        id: "epilogue",
        ref: "Rev 22:6–21",
        excerpt: "These sayings are faithful and true. Surely I come quickly.",
        when: "The book’s own ending, after the new Jerusalem.",
        gloss: "Newton does not fold the closing words into a seal or a trumpet. They are the attestation. The prophecy proper, on his diagram, has already ended in the seventh trumpet: the kingdoms given to God and to Christ, the thousand years, the last judgment, and the city.",
        home: ["22:6-21"]
      }]
    }
  },
  upper: [
    {
      id: "u-vesp",
      year: "Vespasian",
      era: "First head",
      cells: [
        {
          id: "ephesus", col: "ch", span: 4,
          ref: "Rev 2:1–7",
          excerpt: "Unto the angel of the church of Ephesus write.",
          when: "The church preaching, through all four horsemen.",
          gloss: "Ephesus is not, for him, a few years in one city. The letter covers the first four seals together: the church still preaching, while four dynasties of emperors pass. He calls these four the wars of the horsemen, and he puts the lightnings of the temple in the same stretch.",
          home: ["2:1-7"]
        },
        {
          id: "seal-1", col: "seal",
          ref: "Rev 6:1–2",
          excerpt: "A white horse. He went forth conquering, and to conquer.",
          when: "An eastern dynasty. Vespasian, Titus, Domitian.",
          gloss: "White for a good ruler, a bow for conquest, the first living creature standing to the east. Newton names Vespasian, made emperor in Judea, and the war that burned Jerusalem and the Temple. The Apocalypse, on his date for it, has just been written. This is the first thing it looks forward to.",
          home: ["6:1-2"]
        },
        {
          id: "drag-1", col: "drag", span: 4,
          ref: "Rev 4:5",
          excerpt: "Lightnings and thunderings and voices, through the wars of the four horsemen.",
          when: "Chapter 12 has not started. The church is still the church of the letter to Ephesus.",
          gloss: "In both copies of the synopsis, the first station of the dragon column is not the woman. It is the lightnings, voices, thunderings, earthquake, and great hail that accompany the four horsemen, and “the church preaching the gospel.” The words he is pointing at stand in the throne vision. The woman and the dragon wait until the fifth seal.",
          home: [],
          also: ["4:5"]
        }
      ]
    },
    {
      id: "u-traj",
      year: "Trajan",
      era: "Second head",
      cells: [{
        id: "seal-2", col: "seal",
        ref: "Rev 6:3–4",
        excerpt: "A red horse. Power was given to him to take peace from the earth.",
        when: "A western dynasty. Trajan through Commodus.",
        gloss: "The second creature stands to the west, and this dynasty is Spanish. Newton’s instance of “they should kill one another” is the Jewish revolt under Trajan, in Cyrene, Egypt, and Cyprus, and the killing that followed. Red is the color he gives that bloodshed.",
        home: ["6:3-4"]
      }]
    },
    {
      id: "u-sev",
      year: "Severus",
      era: "Third head",
      cells: [{
        id: "seal-3", col: "seal",
        ref: "Rev 6:5–6",
        excerpt: "A black horse. He that sat on him had a pair of balances in his hand.",
        when: "A southern dynasty. Severus and his line.",
        gloss: "Balances are a judge. Newton spends pages on Severus as judge, on the executions of senators, and on the corn, oil, and wine of the Roman dole. The black horse is the color of those funerals. The third creature stands to the south, and Septimius Severus was African.",
        home: ["6:5-6"]
      }]
    },
    {
      id: "u-dec",
      year: "Decius",
      era: "Fourth head",
      cells: [{
        id: "seal-4", col: "seal",
        ref: "Rev 6:7–8",
        excerpt: "A pale horse. His name that sat on him was Death, and Hell followed.",
        when: "A northern dynasty, then sword, famine, pestilence, and invasion.",
        gloss: "Decius dies with his army on campaign, so the rider’s name is Death. Newton then reads the rest of the verse across the short, violent reigns that follow, down to Diocletian: civil war, plague, famine, and nations invading the empire. The fourth creature stands to the north.",
        home: ["6:7-8"]
      }]
    },
    {
      id: "u-dio",
      year: "Diocletian",
      era: "Fifth head",
      cells: [
        {
          id: "smyrna", col: "ch",
          ref: "Rev 2:8–11",
          excerpt: "Unto the church in Smyrna write. Ye shall have tribulation ten days.",
          when: "The church persecuted.",
          gloss: "Smyrna is the poor, faithful church under sentence of death. He sets it beside the fifth seal, the cry of the martyrs, and beside the woman in travail with the dragon waiting. This is the last heathen persecution, Diocletian’s.",
          home: ["2:8-11"]
        },
        {
          id: "seal-5", col: "seal",
          ref: "Rev 6:9–11",
          excerpt: "I saw under the altar the souls of them that were slain. Rest yet for a little season.",
          when: "The Great Persecution.",
          gloss: "The fifth seal is not a new kind of vision. It is the next head of the empire: Diocletian and his colleagues, who divided the empire by consent and then persecuted. The “little season” is the wait until the sixth seal.",
          home: ["6:9-11"]
        },
        {
          id: "drag-2", col: "drag",
          ref: "Rev 12:1–4, 7–8",
          excerpt: "A woman travailing. A great red dragon stood before the woman. Michael fought against the dragon.",
          when: "The same persecution, told in the other half of the book.",
          gloss: "He takes the travail and the war in heaven as one moment with the fifth seal, and he holds the catching up of the child for the next. In the scroll, the child is caught up at verse 5, before the war. On the diagram, verse 5 belongs to the triumph, with Constantine.",
          home: ["12:1-4", "12:7-8"]
        }
      ]
    },
    {
      id: "u-con",
      year: "Constantine",
      era: "Sixth head",
      cells: [
        {
          id: "pergamum", col: "ch",
          ref: "Rev 2:12–17",
          excerpt: "Unto the church in Pergamos write. I know where thou dwellest, even where Satan’s seat is.",
          when: "The church triumphant. Heathenism dethroned.",
          gloss: "Pergamum is where Satan’s throne was, and where the church now holds a name in the midst of that power. He reads the sixth seal, the end of the heathen world, in the same years: Constantine’s house, the empire become Christian.",
          home: ["2:12-17"]
        },
        {
          id: "seal-6", col: "seal",
          ref: "Rev 6:12–17",
          excerpt: "The sun became black, the stars fell, and the heaven departed as a scroll.",
          when: "The end of the heathen world, not the end of the world.",
          gloss: "Kings and captains hide from the face of the Lamb. Newton’s history for this earthquake is the fall of the old religion and the Christian empire. A compressed list in the same manuscript puts a figure, 424, beside “dethrones heathenism.” The long essay on the heads, just before the diagram, names Constantine’s family instead, and that is the reading followed here.",
          home: ["6:12-17"]
        },
        {
          id: "drag-3", col: "drag",
          ref: "Rev 12:5, 9–12",
          excerpt: "Her child was caught up unto God. The dragon was cast out into the earth.",
          when: "The manchild caught up. The church triumphant.",
          gloss: "The child is the church’s cause brought to the throne, and the dragon cast out of heaven is heathen rule losing the empire. He notes that the dragon, once cast down, “hath but a short time.” The short time is the rest of the sixth head, before the seventh seal’s wars begin.",
          home: ["12:5", "12:9-12"]
        }
      ]
    },
    {
      id: "u-337",
      year: "337",
      era: "Sixth head",
      cells: [
        {
          id: "thyatira", col: "ch",
          ref: "Rev 2:18–29",
          excerpt: "Unto the church in Thyatira write. That woman Jezebel. I will give unto every one of you according to your works.",
          when: "The church and the empire divided.",
          gloss: "The stars in this stretch of his chart are not new seals. Thyatira, Sardis, Philadelphia, and Laodicea are four states inside the sixth head, after the sixth seal and before the seventh opens. Thyatira is the division. Constantine dies and the empire is parted among his sons. The woman is given the eagle’s wings. The serpent casts a flood after her.",
          home: ["2:18-29"]
        },
        {
          id: "seal-rest", col: "seal", span: 4,
          ref: "The sixth head, continued",
          excerpt: "No new seal. The asterisks on his chart keep this head open.",
          when: "Division, reunion, affliction, then the war on the remnant.",
          gloss: "His rule, already fixed in the early “Positions” and still the rule of this diagram: the seals succeed one another and do not overlap, and the seventh head runs through a silence and then through all the trumpets. These four church-states are inside the sixth head. The next seal is the one that opens onto the trumpets.",
          home: []
        },
        {
          id: "drag-4", col: "drag",
          ref: "Rev 12:13–15",
          excerpt: "To the woman were given two wings of a great eagle. The serpent cast out of his mouth water as a flood.",
          when: "At the death of Constantine the empire divides.",
          gloss: "The flood is the division itself, a kingdom poured out after the woman. He will read the woman’s arrival at her place, and the 1,260 days of her feeding, much later, with the woe trumpets. Here she only flees.",
          home: ["12:13-15"]
        }
      ]
    },
    {
      id: "u-reu",
      year: "Constantius",
      era: "Sixth head",
      cells: [
        {
          id: "sardis", col: "ch",
          ref: "Rev 3:1–6",
          excerpt: "Unto the church in Sardis write. Thou hast a name that thou livest, and art dead.",
          when: "The church and the empire reunited.",
          gloss: "Sardis has the name of life and is dead. Beside it he puts the earth swallowing the flood: Constantius defeats Magnentius and the empire is one again. In the other vision this is the wound of the beast, deadly for a time. The beast “was, and is not.”",
          home: ["3:1-6"]
        },
        {
          id: "drag-5", col: "drag",
          ref: "Rev 12:16",
          excerpt: "The earth helped the woman, and the earth opened her mouth, and swallowed up the flood.",
          when: "The western usurpation is swallowed. One empire again.",
          gloss: "A single verse, given its own station on the chart. The reunion is not the end of the story. The next station is the dragon’s wrath, and the one after that is the war on the remnant. Both are still inside the sixth head.",
          home: ["12:16"]
        }
      ]
    },
    {
      id: "u-wrath",
      year: "—",
      era: "Sixth head",
      cells: [
        {
          id: "philadelphia", col: "ch",
          ref: "Rev 3:7–13",
          excerpt: "Unto the church in Philadelphia write. Thou hast a little strength, and hast kept my word.",
          when: "The dragon is wroth with the woman. The church in affliction.",
          gloss: "Philadelphia is the church he does not accuse. He leaves it in affliction beside the dragon’s wrath. He does not pin this station, or the next, to a year. The synopsis marks them with an asterisk and a clause, and stops there.",
          home: ["3:7-13"]
        },
        {
          id: "drag-6", col: "drag",
          ref: "Rev 12:17",
          excerpt: "The dragon was wroth with the woman.",
          when: "The first clause of the verse. The second clause is Laodicea.",
          gloss: "He splits one verse across two church-states. Wrath with the woman is Philadelphia. Going to make war with the remnant of her seed is Laodicea. The line is lit here and read in full at the next station.",
          home: [],
          also: ["12:17"]
        }
      ]
    },
    {
      id: "u-rem",
      year: "—",
      era: "Sixth head",
      cells: [
        {
          id: "laodicea", col: "ch",
          ref: "Rev 3:14–22",
          excerpt: "Unto the church of the Laodiceans write. Because thou art lukewarm, I will spue thee out of my mouth.",
          when: "The dragon goes to make war with the remnant of her seed.",
          gloss: "Laodicea is the last state of the first temple: rich, and about to be spewed out. What remains is the remnant. The next thing on the diagram is the seventh seal, the sealing of 144,000 out of the tribes, and everyone else receiving another mark.",
          home: ["3:14-22"]
        },
        {
          id: "drag-7", col: "drag",
          ref: "Rev 12:17",
          excerpt: "The dragon went to make war with the remnant of her seed, which keep the commandments of God.",
          when: "The church, that remnant.",
          gloss: "This is the last station of chapter 12 before the seventh seal. The woman has fled. The remnant is what the dragon can still reach. Newton’s seven letters end here. The trumpets have not begun.",
          home: ["12:17"]
        }
      ]
    }
  ],
  lower: [
    {
      id: "l-open",
      year: "Part 1",
      era: "Silence. The first of eight parts",
      group: "The silence",
      cells: [
        {
          id: "winds-held", col: "wind",
          ref: "Rev 7:1–8",
          excerpt: "Hold the four winds. Hurt not the earth, till we have sealed the servants of our God.",
          when: "144,000 sealed out of the twelve tribes.",
          gloss: "The winds are the wars of the first four trumpets, and they are held while the servants are sealed. He takes the 144,000 as the remnant, named and numbered. The rest of Israel, in his reading, are about to receive the mark of the beast.",
          home: ["7:1-8"]
        },
        {
          id: "silence", col: "trump",
          ref: "Rev 8:1–4",
          excerpt: "There was silence in heaven about the space of half an hour. The angel offered the incense with the prayers of the saints.",
          when: "The calm while Theodosius held the nations back. He dies in 395.",
          gloss: "Silence, then incense, on the day of the fast. Newton’s history for the calm is the reign of Theodosius, who checked the barbarians. The half hour ends at his death. The first trumpet is the wind that blows next.",
          home: ["8:1-4"]
        },
        {
          id: "measure", col: "wit",
          ref: "Rev 11:1",
          excerpt: "Rise, and measure the temple of God, and the altar, and them that worship therein.",
          when: "The worshippers are separated from the court.",
          gloss: "Measuring is a separating. The temple, the altar, and the worshippers are kept. The outer court is the next verse, and he does not read it yet. The giving of the court to the Gentiles, and the 42 months, wait for the woe trumpets.",
          home: ["11:1"]
        },
        {
          id: "beast-rises", col: "beast",
          ref: "Rev 13",
          excerpt: "A beast rose up out of the sea. Another beast caused the earth to worship the first, and to receive his mark.",
          when: "The western empire, wounded and then revived, becomes the subject of the trumpets.",
          gloss: "The beast from the sea is the western empire, derived out of the dragon. The wound is the reunion under Constantius, when for a time there was no separate west. The second beast makes an image of the first and enforces the mark. Newton puts this whole scene at the opening of the seventh seal, and he reads one clause of it again at the first trumpet: the dragon giving the beast his throne.",
          home: ["13:1-18"]
        },
        {
          id: "vials-appear", col: "vial",
          ref: "Rev 15:1",
          excerpt: "Seven angels having the seven last plagues.",
          when: "They appear now. They pour later, one plague with each trumpet.",
          gloss: "The vials are not a third age after the trumpets. His early Positions already say the trumpets, the thunders, and the vials are the same seven wars. The synopsis draws that as three parallel columns. The angels are seen at the opening. Each vial is poured in the row of its trumpet.",
          home: ["15:1"]
        },
        {
          id: "beast-ascends", col: "whore",
          ref: "Rev 17:1–8",
          excerpt: "The beast that was, and is not, shall ascend out of the bottomless pit, and go into perdition.",
          when: "A new division. He names Valentinian, and the empire stays divided.",
          gloss: "“Was, and is not” is the west during the wound. The ascent out of the pit is the division that does not heal: from Valentinian and Valens the empire remains two empires, apart from the last months of Theodosius, which he says are too short to count. This seventh head then runs through every trumpet.",
          home: ["17:1-8"]
        }
      ]
    },
    {
      id: "l-pause",
      year: "Half an hour",
      era: "Still part 1, before the winds blow",
      group: "The silence",
      cells: [
        {
          id: "fire-cast", col: "trump",
          ref: "Rev 8:5–6",
          excerpt: "The angel cast the fire into the earth. There were voices, and thunderings, and lightnings, and an earthquake.",
          when: "The seven angels prepare to sound.",
          gloss: "The censer is emptied onto the earth, and only then do the angels raise the trumpets. This is the last thing in the silence. The next row is the first war.",
          home: ["8:5-6"]
        },
        {
          id: "zion", col: "beast",
          ref: "Rev 14:1–5",
          excerpt: "A Lamb stood on the mount Sion, and with him an hundred forty and four thousand.",
          when: "The firstfruits. The harvest is the seventh trumpet.",
          gloss: "The 144,000 stand with the Lamb before the wars, singing a new song. He calls them the firstfruits of the harvest, and he refuses to read the harvest here. The sickle comes in the last row.",
          home: ["14:1-5"]
        },
        {
          id: "sea-glass", col: "vial",
          ref: "Rev 15:2–16:1",
          excerpt: "Them that had gotten the victory stand on the sea of glass. The seven angels received seven golden vials.",
          when: "The vials are handed over. Not yet poured.",
          gloss: "The victors sing the song of Moses and the Lamb. Then the temple is opened and the angels come out and are given the vials. “Go your ways, and pour out the vials” is the commission. The pouring is the column to the right of the trumpets, row by row.",
          home: ["15:2-8", "16:1"]
        }
      ]
    },
    {
      id: "t1",
      year: "395",
      era: "Part 2 · first trumpet",
      group: "Four winds",
      cells: [
        {
          id: "t1-wind", col: "wind",
          ref: "The east wind",
          excerpt: "The east wind. War on the earth.",
          when: "The eastern empire, for twelve years after Theodosius.",
          gloss: "The four winds were held in chapter 7. He now lets them blow one by one, each wind a region of the Roman world. The first is eastern. On the leaf facing the diagram: after the death of Theodosius in 395, the eastern empire is vexed for twelve years by invading nations. In the fuller narrative he names Alaric and the Goths in Macedon and Greece that same year, and the nations that crossed the Danube.",
          home: [],
          also: ["7:1"]
        },
        {
          id: "t1-trump", col: "trump",
          ref: "Rev 8:7",
          excerpt: "Hail and fire mingled with blood were cast upon the earth. The third part of trees was burnt up.",
          when: "A war, not a weather.",
          gloss: "Hail, fire, and blood are his standing figure for battle. “The earth” is one of the three parts of the prophetic world, here the east. The first vial falls on the same earth, in the column across the chart.",
          home: ["8:7"]
        },
        {
          id: "t1-thun", col: "thun",
          ref: "First thunder",
          excerpt: "The first thunder. Unwritten.",
          when: "The same war, in the sealed voice.",
          gloss: "There is no text to put here. “Write them not.” The cell is on the diagram because the synopsis has a thunder beside every trumpet, and because the identification is the point: this thunder is this war.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t1-wit", col: "wit",
          ref: "Rev 11:5",
          excerpt: "Fire proceedeth out of their mouth, and devoureth their enemies.",
          when: "The witnesses’ power at the first trumpet. The sackcloth comes later.",
          gloss: "He separates two things the scroll puts in one paragraph. The power to call down fire, to turn water to blood, and to strike with plagues is exercised at the trumpets, as often as the witnesses will. The 1,260 days in sackcloth are the woe trumpets only, and they have not begun.",
          home: [],
          also: ["11:5"]
        },
        {
          id: "t1-throne", col: "beast",
          ref: "Rev 13:2–4",
          excerpt: "The dragon gave him his power, and his seat, and great authority. All the world wondered after the beast.",
          when: "Read here again, at the first war of the seventh head.",
          gloss: "These verses live, in his order, with the rising of the beast at the opening of the seal. He points back to them from this row. The giving of the throne and the world’s wonder belong, he says, to the moment the trumpets start.",
          home: [],
          also: ["13:2-4"]
        },
        {
          id: "t1-vial", col: "vial",
          ref: "Rev 16:2",
          excerpt: "The first poured out his vial upon the earth. A noisome and grievous sore.",
          when: "The same earth as the first trumpet.",
          gloss: "The sore, like the hail and the fire, is a war. It falls on those who have the mark. Trumpet and vial name one campaign.",
          home: ["16:2"]
        },
        {
          id: "t1-eighth", col: "whore",
          ref: "Rev 17:9–13",
          excerpt: "Five are fallen, and one is. The eighth is of the seven. The ten horns receive power as kings one hour with the beast.",
          when: "The eighth king reigns. The ten kingdoms begin to receive power.",
          gloss: "“Five are fallen, and one is” is the standpoint of the sixth head, when the beast is wounded and “is not.” The eighth, who is of the seven, is the west risen again, and Newton puts his reign in this row. The ten horns receiving power is the breakup that the next trumpet describes from the west.",
          home: ["17:9-13"]
        }
      ]
    },
    {
      id: "t2",
      year: "407",
      era: "Part 3 · second trumpet",
      group: "Four winds",
      cells: [
        {
          id: "t2-wind", col: "wind",
          ref: "The west wind",
          excerpt: "The west wind. War on the sea.",
          when: "The western empire, from 407.",
          gloss: "Facing the diagram he writes that from 407 the western empire is vexed for years across Europe, becomes divided into ten kingdoms, and Rome is sacked by the Visigoths.",
          home: [],
          also: ["7:1"]
        },
        {
          id: "t2-trump", col: "trump",
          ref: "Rev 8:8–9",
          excerpt: "A great mountain burning with fire was cast into the sea. The third part of the ships were destroyed.",
          when: "The sea is the west.",
          gloss: "Second trumpet, second region. The burning mountain cast into the sea is the war in the western empire, and the ships lost with it.",
          home: ["8:8-9"]
        },
        {
          id: "t2-thun", col: "thun",
          ref: "Second thunder",
          excerpt: "The second thunder. Unwritten.",
          when: "The same war.",
          gloss: "Sealed, and identified with the trumpet and the vial in this row.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t2-wit", col: "wit",
          ref: "Rev 11:6",
          excerpt: "These have power to turn the waters to blood.",
          when: "Their power at the second trumpet, as Moses did.",
          gloss: "He assigns the turning of waters to blood to this trumpet in particular, and the rest of the plagues to the witnesses “as often as they will.”",
          home: [],
          also: ["11:6"]
        },
        {
          id: "t2-vial", col: "vial",
          ref: "Rev 16:3",
          excerpt: "The second poured out his vial upon the sea. It became as the blood of a dead man.",
          when: "The same sea.",
          gloss: "Trumpet and vial share the sea, and both end in death throughout it.",
          home: ["16:3"]
        }
      ]
    },
    {
      id: "t3",
      year: "427",
      era: "Part 4 · third trumpet",
      group: "Four winds",
      cells: [
        {
          id: "t3-wind", col: "wind",
          ref: "The south wind",
          excerpt: "The south wind. War on the rivers.",
          when: "The other copy of the diagram swaps this wind with the north.",
          gloss: "This interface follows the copy that matches the historical key on the facing leaf, and matches his earlier essay on the fourth trumpet: third is south, fourth is north. The second copy of the synopsis reverses those two directions. The history he wrote beside the chart does not: from 427 the southern parts are invaded and vexed for many years by the Vandals. The western emperor falls. His dominion passes to the Heruli, and afterward to the Ostrogoths.",
          home: [],
          also: ["7:1"]
        },
        {
          id: "t3-trump", col: "trump",
          ref: "Rev 8:10–11",
          excerpt: "A great star fell upon the third part of the rivers. The name of the star is Wormwood.",
          when: "The rivers and the fountains.",
          gloss: "The third region is waters inland, not the sea of the second trumpet. Wormwood is the bitterness of that war.",
          home: ["8:10-11"]
        },
        {
          id: "t3-thun", col: "thun",
          ref: "Third thunder",
          excerpt: "The third thunder. Unwritten.",
          when: "The same war.",
          gloss: "Sealed, and set in this row with the trumpet and the vial.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t3-vial", col: "vial",
          ref: "Rev 16:4–7",
          excerpt: "The third poured out his vial upon the rivers. They became blood.",
          when: "The same rivers.",
          gloss: "The angel of the waters speaks, and the altar answers. He takes the agreement of trumpet and vial here as exact: both on the rivers, both blood.",
          home: ["16:4-7"]
        }
      ]
    },
    {
      id: "t4",
      year: "536",
      era: "Part 5 · fourth trumpet",
      group: "Four winds",
      cells: [
        {
          id: "t4-wind", col: "wind",
          ref: "The north wind",
          excerpt: "The north wind. War on the sun.",
          when: "Lombardy and the north of Italy.",
          gloss: "From 536, he writes, the Greek emperor invades the northern parts, Lombardy and the rest of northern Italy, and the land is afflicted by the wars with the Goths and the Lombards. The kingdom of the Goths, the Roman senate, the consulship, and what remained of the western empire are extinguished. An early Latin essay, “The Fourth Trumpet,” is already this war: Belisarius, the Gothic war, the light of Rome put out.",
          home: [],
          also: ["7:1"]
        },
        {
          id: "t4-trump", col: "trump",
          ref: "Rev 8:12",
          excerpt: "The third part of the sun was smitten, and the moon, and the stars, so as the third part of them was darkened.",
          when: "The light of the western empire put out.",
          gloss: "Sun, moon, and stars darkened together are, for him, the honor of rule. A third part is the west. After this trumpet the four winds have done their work. The next sound is a woe.",
          home: ["8:12"]
        },
        {
          id: "t4-thun", col: "thun",
          ref: "Fourth thunder",
          excerpt: "The fourth thunder. Unwritten.",
          when: "The same darkening.",
          gloss: "Sealed. Last of the four, in the row where the western lights go out.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t4-vial", col: "vial",
          ref: "Rev 16:8–9",
          excerpt: "The fourth poured out his vial upon the sun. Men were scorched with fire.",
          when: "The same sun.",
          gloss: "The vial scorches by the sun that the trumpet darkens. He treats them as one plague in two figures, fire and loss of light, which are his two figures for a consuming war.",
          home: ["16:8-9"]
        }
      ]
    },
    {
      id: "t5",
      year: "607",
      era: "Part 6 · first woe",
      group: "First woe",
      tone: "long",
      cells: [
        {
          id: "t5-trump", col: "trump",
          ref: "Rev 9:1–12",
          excerpt: "A star fell. He opened the bottomless pit. There came out locusts upon the earth. One woe is past.",
          when: "607, the universal bishopric. Mahomet. The Saracens.",
          gloss: "On the leaf facing the diagram he dates this trumpet to 607, when Phocas grants the pope the title of universal bishop, and to the setting up of the worship of Mary and all the saints in the Pantheon. At the same time, he writes, Mahomet composes the Alcoran, and the Saracen monarchy annexes Syria, Egypt, and more. He counts that empire, seated first at Antioch and then at Baghdad, as 300 years, “twice five months.” A later computation in the same papers lengthens it: the locusts from 609, when he has Mahomet set up as a prophet, until the fall of Baghdad in 1258. Both figures are his. They do not agree, and the diagram’s shape does not depend on which he was using.",
          home: ["8:13", "9:1-12"]
        },
        {
          id: "t5-thun", col: "thun",
          ref: "Fifth thunder",
          excerpt: "The fifth thunder. Unwritten.",
          when: "The first woe, in the sealed voice.",
          gloss: "From here the thunders are woes. Still unwritten. Still the same war as the trumpet and the vial.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t5-vial", col: "vial",
          ref: "Rev 16:10–11",
          excerpt: "The fifth poured out his vial upon the seat of the beast. His kingdom was full of darkness.",
          when: "The throne itself, not a region of the map.",
          gloss: "The first four vials followed the four regions. The fifth falls on the seat. Darkness, and pain, and they do not repent. This is the row where he begins the deepest stretch of the apostasy.",
          home: ["16:10-11"]
        }
      ]
    },
    {
      id: "sack",
      year: "1,260 years",
      era: "Inside the first woe, and until the witnesses are killed",
      group: "First woe",
      tone: "long",
      cells: [
        {
          id: "sack-wit", col: "wit",
          ref: "Rev 11:2–6",
          excerpt: "The holy city shall they tread under foot forty and two months. My two witnesses shall prophesy a thousand two hundred and threescore days, clothed in sackcloth.",
          when: "The same count: the woman’s time in the wilderness, the beast’s war, the whore’s reign.",
          gloss: "An early Position he never gave up: the 42 months, the woman’s stay in the wilderness, the treading of the holy city, and the witnesses in sackcloth are one period, and it runs from the beginning of the woe trumpets to the killing of the witnesses. It does not run through the four winds. The two witnesses are, for him, the two churches that remain lamps, like Haggai and Zechariah at the building of the second temple. Smyrna and Philadelphia are the letters he did not condemn, and he leaves them in that office.",
          home: ["11:2-6"]
        },
        {
          id: "sack-woman", col: "beast",
          ref: "Rev 12:6",
          excerpt: "The woman fled into the wilderness, where they should feed her a thousand two hundred and threescore days.",
          when: "She arrives at her place. The flight itself was earlier, at the division.",
          gloss: "Verse 6 is where he reads the arrival and the feeding. The wings and the flood were the division after Constantine, decades before 607 on his dates. The diagram pulls this one verse down to the woe. He also points at 12:14, the time, times, and half a time, which on the chart stands up with the wings. Same count, two stations.",
          home: ["12:6"],
          also: ["12:14"]
        },
        {
          id: "sack-whore", col: "whore",
          ref: "Rev 17:15–18:15",
          excerpt: "The ten horns give their kingdom unto the beast. She sitteth upon him. The merchants of the earth wax rich through her delicacies.",
          when: "He tried 607, and he tried 800. From 800 the count reaches 2060.",
          gloss: "The whore is the city that reigns over the kings of the earth, fed in the wilderness by the merchants, the nations drunk with her wine. The ten horns agree and hand their kingdom over. This is the period he kept trying to date. The facing leaf starts it at 607 and 608. Elsewhere he starts the completed rise at 800, when three kings are subdued and Charlemagne is crowned, and he adds 1,260 years to reach 2060. In that later note he says it may end later, he sees no reason it should end sooner, and he is writing the figure down to stop rash predictions, not to announce the day. “Christ comes as a thief in the night.”",
          home: ["17:15", "17:17-18", "18:3", "18:11-15"]
        }
      ]
    },
    {
      id: "t6",
      year: "The Turks",
      era: "Part 7 · second woe",
      group: "Second woe",
      cells: [
        {
          id: "t6-trump", col: "trump",
          ref: "Rev 9:13–21",
          excerpt: "Loose the four angels which are bound in the great river Euphrates. The rest repented not.",
          when: "Four kingdoms on the Euphrates. Tartars in 1260. Then Constantinople.",
          gloss: "The facing key seats the Turks in four kingdoms about the fountains and streams of the Euphrates, names Mosul, Miyapharekin, and Aleppo, and says a fourth whose name is damaged in the transcription. His map of this trumpet names Iconium, Damascus, Mosul, and Meyafarikin. The Tartars invade in 1260, the royal cities are sacked, the remnant flees into Asia Minor, and that power at length sacks Constantinople and takes the Greek empire. The hour, day, month, and year of the verse are his kind of sum. He does not, on this leaf, write the arithmetic out.",
          home: ["9:13-21"]
        },
        {
          id: "t6-thun", col: "thun",
          ref: "Sixth thunder",
          excerpt: "The sixth thunder. Unwritten.",
          when: "The second woe.",
          gloss: "Sealed. The war from the Euphrates, in the column of the thunders.",
          home: [],
          also: ["10:3-4"]
        },
        {
          id: "t6-vial", col: "vial",
          ref: "Rev 16:12",
          excerpt: "The sixth poured out his vial upon the great river Euphrates. The water thereof was dried up.",
          when: "The same river as the sixth trumpet.",
          gloss: "The drying of the river is the way prepared for the kings. Trumpet and vial share the Euphrates, which is as close a synchronism as the chart has.",
          home: ["16:12"]
        }
      ]
    },
    {
      id: "turn",
      year: "End of the 1,260",
      era: "Revelation 10 is the mark",
      group: "Second woe",
      cells: [
        {
          id: "rev10", col: "thun",
          ref: "Revelation 10",
          excerpt: "A mighty angel stands on the sea and on the earth. Seven thunders utter their voices, and John is told to write them not. The angel swears that there should be time no longer. Take the book, and eat it, and prophesy again.",
          when: "The mark of the end of the 1,260. Moved here from the head of the chart and from the opening rows.",
          gloss: "Chapter 10, and the first thirteen verses of chapter 11, are the parenthesis between the sixth trumpet and the seventh. The angel swears, after the seven thunders, that there should be time no longer, but in the days of the voice of the seventh angel the mystery of God should be finished. Eating the book is the warrant to prophesy again. The box stands here, at the end of the 1,260, not at the door. The door remains 11:19.",
          home: ["10:1-11"]
        },
        {
          id: "turn-wit", col: "wit",
          ref: "Rev 11:7–12",
          excerpt: "The beast shall kill them. They stood upon their feet. They ascended up to heaven in a cloud.",
          when: "The end of the 1,260 days. Not the end of the trumpet.",
          gloss: "The sackcloth ends when the witnesses are killed. He then has them raised and taken up before the seventh trumpet. A tenth of the city falls in the next row, still inside this woe.",
          home: ["11:7-12"]
        },
        {
          id: "turn-gospel", col: "beast",
          ref: "Rev 14:6–7",
          excerpt: "The everlasting gospel to preach unto them that dwell on the earth, to every nation.",
          when: "The first of three cries he places at the close of the woe.",
          gloss: "Chapter 14, after the 144,000, is a sequence he pulls apart. The gospel to all nations is this row. Babylon fallen, and the warning against the mark, are the next. The harvest and the vintage wait for the seventh trumpet.",
          home: ["14:6-7"]
        },
        {
          id: "turn-frogs", col: "vial",
          ref: "Rev 16:13–16",
          excerpt: "Three unclean spirits like frogs. They go forth unto the kings of the earth, to gather them to the battle of that great day.",
          when: "Armageddon is named. The battle is the seventh trumpet.",
          gloss: "The frogs come out of the mouth of the dragon, the beast, and the false prophet, after the Euphrates vial. He puts the gathering here, and the battle itself in the last row.",
          home: ["16:13-16"]
        },
        {
          id: "turn-eat", col: "whore",
          ref: "Rev 17:16",
          excerpt: "The ten horns shall hate the whore, and shall eat her flesh, and burn her with fire.",
          when: "The same horns that gave her the kingdom.",
          gloss: "Giving the kingdom was the long reign. Eating her flesh is the end of it. He separates the two clauses by the whole 1,260 years.",
          home: ["17:16"]
        }
      ]
    },
    {
      id: "cry",
      year: "Babylon fallen",
      era: "The last acts of the sixth trumpet",
      group: "Second woe",
      cells: [
        {
          id: "cry-city", col: "wit",
          ref: "Rev 11:13",
          excerpt: "The tenth part of the city fell. The remnant were affrighted, and gave glory to the God of heaven.",
          when: "A foretaste, he says, of the cities of the nations falling.",
          gloss: "The synopsis says the second woe ends with this fall. An earlier draft of the same leaf names it: Babylon, whose revenue is the tenth part of the great city. In the early parallel of trumpets and vials he is careful that this tenth, which ends the sixth trumpet, is not the same event as the cities of the nations, which begin the seventh vial. It is the immediate forerunner.",
          home: ["11:13"]
        },
        {
          id: "cry-bab", col: "beast",
          ref: "Rev 14:8–12",
          excerpt: "Babylon is fallen, is fallen. If any man worship the beast and his image, the same shall drink of the wine of the wrath of God.",
          when: "False worship forbidden.",
          gloss: "Two cries in one cell, because his chart gives them two lines and one moment: the fall announced, and the warning that remains while it is announced.",
          home: ["14:8-12"]
        },
        {
          id: "cry-fall", col: "whore",
          ref: "Rev 18–19",
          excerpt: "Babylon the great is fallen. Rejoice over her. The marriage of the Lamb is come. Heaven opened, and behold a white horse.",
          when: "Much people rejoice. The Word of God rides out. The lake is the next row.",
          gloss: "The second copy of the synopsis adds the marriage of the Lamb to this moment. The first copy already has heaven opened and the rider on the white horse, making war, still before the seventh vial. The casting of the beast and the false prophet into the lake is held for the last trumpet. The lament of the merchants is the fall. The wealth that made them rich was the long row above.",
          home: ["17:14", "18:1-2", "18:4-10", "18:16-24", "19:1-19"]
        }
      ]
    },
    {
      id: "t7",
      year: "Eighth part",
      era: "The seventh trumpet. The millennium day",
      group: "Third woe",
      tone: "end",
      cells: [
        {
          id: "t7-palm", col: "wind",
          ref: "Rev 7:9–17",
          excerpt: "A great multitude, of all nations, with palms in their hands. God shall wipe away all tears from their eyes.",
          when: "John sees them in chapter 7. Newton reads them at the end.",
          gloss: "The multitude comes out of the great tribulation. In the scroll they appear before a single trumpet has sounded. On the diagram they are the victory of the last trumpet. This is the sharpest jump in the book, and the minimap shows it: a block of lines up in chapter 7, lit while you are standing at the bottom of the chart.",
          home: ["7:9-17"]
        },
        {
          id: "t7-trump", col: "trump",
          ref: "Rev 11:14–18",
          excerpt: "The second woe is past. The kingdoms of this world are become the kingdoms of our Lord, and of his Christ.",
          when: "The third woe. The dead are judged. The saints rewarded.",
          gloss: "The seventh angel sounds, and the loud voices give the kingdoms over. The temple then opens and the ark is seen: that verse, 11:19, he also uses as the door of the second half, so it is the hinge above, not this cell. The wrath, the dead, and the reward are this cell.",
          home: ["11:14-18"]
        },
        {
          id: "t7-harvest", col: "beast",
          ref: "Rev 14:13–20",
          excerpt: "Thrust in thy sickle, and reap. The angel gathered the vine, and cast it into the great winepress of the wrath of God.",
          when: "The harvest of the martyrs. The vintage of the wicked.",
          gloss: "Blood to the horse bridles, outside the city. He has kept this sickle back from the row where the 144,000 stood on Zion. They were the firstfruits. This is the harvest.",
          home: ["14:13-20"]
        },
        {
          id: "t7-vial", col: "vial",
          ref: "Rev 16:17–21",
          excerpt: "The seventh poured out his vial into the air. It is done. The cities of the nations fell. Great Babylon came in remembrance before God.",
          when: "A plague of hail, last of all.",
          gloss: "“It is done” answers the seventh trumpet’s “it is finished.” The cities fall, the cup is drunk, and the hail is exceeding great. He had said the tenth of the city, one row up, was only the forerunner of this.",
          home: ["16:17-21"]
        },
        {
          id: "t7-end", col: "whore",
          ref: "The millennium day",
          excerpt: "The thousand years, which are with God but as a day. The beast and the false prophet cast into the lake. The dragon bound. A new heaven and a new earth.",
          when: "The eighth part has no year-length. From 800 he reaches 2060, and says it may be later.",
          gloss: "The millennium day. The thousand years, which are with God but as a day, are this trumpet, and this trumpet is the eighth part of the seventh seal. He gives it no year-length. The rider has already come out, in the row above. Here the beast and the false prophet go into the lake, the rest are slain, and the dragon is shut in the pit. The thousand years, Gog and Magog, the general judgment, and the city are this one station on his chart. The second copy adds that heaven and earth flee, and the saints reign under God and the Lamb for ever. He would not turn the 2060 figure into an announcement. The note in Yahuda MS 7.3 says the time, times, and half a time, counted from 800, reach 2060, may end later, and were written to restrain people who keep predicting the day and bringing the prophecies into contempt.",
          home: ["19:20-21", "20:1-15", "21:1-27", "22:1-5"]
        }
      ]
    }
  ]
};
