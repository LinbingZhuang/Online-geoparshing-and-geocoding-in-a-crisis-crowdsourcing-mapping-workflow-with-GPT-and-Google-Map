# Online geoparshing and geocoding in a crisis crowdsourcing mapping workflow with GPT and Google Map

User-generated messages with geographical information on social media platforms (such as tweets) have been found to play an increasingly important role in crisis crowdsourced mapping. Manually extracting information requires significant human effort and time, and traditional named entity recognition methods have been shown to struggle with accurately extracting specific locations from the messages. Message content from social media is an ideal source for helping promptly pointing the specific locations where the disaster-related events occur. But how to process a large amount of not well-organized text is also so challenging. Although recruiting many volunteers to extract information and map the data manually is a possible solution, but the stress faced by volunteers in emergency scenarios may impact their mental health, which is also not good for the sustainability of crisis crowdsourcing mapping. 

In this study, I propose an approach that combines Generative Pre-trained Transformer (GPT) with Google geocoder to automate geoparsing and geocoding. This suggests that large language models, represented by the GPT models, have the potential to be applied in crisis crowdsourced mapping, benefiting rapid emergency responses and potentially saving lives. 

![workflow](https://github.com/Linbing1065/Online-geoparshing-and-geocoding-in-a-crisis-crowdsourcing-mapping-workflow-with-GPT-and-Google-Map/assets/126106057/a0796104-7fbc-4816-abd9-fd052d68f3ed)
The workflow of the system

![layout](https://github.com/Linbing1065/Online-geoparshing-and-geocoding-in-a-crisis-crowdsourcing-mapping-workflow-with-GPT-and-Google-Map/assets/126106057/49a6c946-204c-4895-95e2-93c6ede0e658)
The layout of the webpage

If you want to use the system, first you need to have your openai_api_key and google_api_key. Then you need to prepare a csv file including messages from social media and their ID (see the example file, sourced from https://digital.library.unt.edu/ark:/67531/metadc993940/ and https://doi.org/10.6084/m9.figshare.22659337). Remember to modify the prompts based on your research area.
